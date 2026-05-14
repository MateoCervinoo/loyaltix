const zlib = require('zlib');
const { ValidationError } = require('sequelize');

const Cliente = require('../models/cliente.model');
const ConfiguracionPuntos = require('../models/configuracionPuntos.model');
const MovimientoPuntos = require('../models/movimientoPuntos.model');

const REQUIRED_COLUMNS = ['identificador', 'monto', 'descripcion'];
const MAX_ROWS = 250;

const decodeXml = (value = '') => (
    String(value)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
);

const columnNameToIndex = (cellRef = '') => {
    const letters = cellRef.replace(/[0-9]/g, '').toUpperCase();
    let index = 0;

    for (const letter of letters) {
        index = index * 26 + (letter.charCodeAt(0) - 64);
    }

    return index - 1;
};

const getZipEntries = (buffer) => {
    const eocdSignature = 0x06054b50;
    let eocdOffset = -1;

    for (let i = buffer.length - 22; i >= 0; i -= 1) {
        if (buffer.readUInt32LE(i) === eocdSignature) {
            eocdOffset = i;
            break;
        }
    }

    if (eocdOffset === -1) {
        throw new Error('El archivo no tiene formato XLSX valido');
    }

    const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
    const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
    const entries = {};
    let offset = centralDirectoryOffset;

    for (let i = 0; i < totalEntries; i += 1) {
        if (buffer.readUInt32LE(offset) !== 0x02014b50) {
            throw new Error('No se pudo leer el contenido del XLSX');
        }

        const compression = buffer.readUInt16LE(offset + 10);
        const compressedSize = buffer.readUInt32LE(offset + 20);
        const uncompressedSize = buffer.readUInt32LE(offset + 24);
        const nameLength = buffer.readUInt16LE(offset + 28);
        const extraLength = buffer.readUInt16LE(offset + 30);
        const commentLength = buffer.readUInt16LE(offset + 32);
        const localHeaderOffset = buffer.readUInt32LE(offset + 42);
        const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

        entries[name] = {
            compression,
            compressedSize,
            uncompressedSize,
            localHeaderOffset,
        };

        offset += 46 + nameLength + extraLength + commentLength;
    }

    return {
        read(name) {
            const entry = entries[name];
            if (!entry) return null;

            const localOffset = entry.localHeaderOffset;
            if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
                throw new Error('No se pudo leer una hoja del XLSX');
            }

            const fileNameLength = buffer.readUInt16LE(localOffset + 26);
            const extraLength = buffer.readUInt16LE(localOffset + 28);
            const dataOffset = localOffset + 30 + fileNameLength + extraLength;
            const data = buffer.subarray(dataOffset, dataOffset + entry.compressedSize);

            if (entry.compression === 0) {
                return data.toString('utf8');
            }

            if (entry.compression === 8) {
                return zlib.inflateRawSync(data, { finishFlush: zlib.constants.Z_SYNC_FLUSH }).toString('utf8');
            }

            throw new Error('El XLSX usa una compresion no soportada');
        },
    };
};

const parseSharedStrings = (xml) => {
    if (!xml) return [];

    const items = [];
    const siMatches = xml.match(/<si[\s\S]*?<\/si>/g) || [];

    siMatches.forEach((item) => {
        const textMatches = [...item.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)];
        items.push(decodeXml(textMatches.map((match) => match[1]).join('')));
    });

    return items;
};

const getFirstSheetPath = (zip) => {
    const workbook = zip.read('xl/workbook.xml');
    const rels = zip.read('xl/_rels/workbook.xml.rels');

    if (!workbook || !rels) {
        throw new Error('El XLSX no contiene hojas validas');
    }

    const firstSheet = workbook.match(/<sheet[^>]*r:id="([^"]+)"/);
    if (!firstSheet) {
        throw new Error('El XLSX no contiene hojas validas');
    }

    const relPattern = new RegExp(`<Relationship[^>]*Id="${firstSheet[1]}"[^>]*Target="([^"]+)"`);
    const relMatch = rels.match(relPattern);
    if (!relMatch) {
        throw new Error('No se pudo encontrar la primera hoja del XLSX');
    }

    const target = relMatch[1].replace(/^\/?xl\//, '');
    return `xl/${target}`;
};

const getCellValue = (cellXml, sharedStrings) => {
    const typeMatch = cellXml.match(/\st="([^"]+)"/);
    const type = typeMatch?.[1];

    if (type === 'inlineStr') {
        const inlineMatch = cellXml.match(/<t[^>]*>([\s\S]*?)<\/t>/);
        return decodeXml(inlineMatch?.[1] || '');
    }

    const valueMatch = cellXml.match(/<v[^>]*>([\s\S]*?)<\/v>/);
    const rawValue = decodeXml(valueMatch?.[1] || '');

    if (type === 's') {
        return sharedStrings[Number(rawValue)] || '';
    }

    return rawValue;
};

const parseRowsFromSheet = (sheetXml, sharedStrings) => {
    const rowMatches = sheetXml.match(/<row[\s\S]*?<\/row>/g) || [];

    return rowMatches.map((rowXml) => {
        const rowNumber = Number(rowXml.match(/\sr="(\d+)"/)?.[1]);
        const cells = [];
        const cellMatches = rowXml.match(/<c[\s\S]*?<\/c>/g) || [];

        cellMatches.forEach((cellXml) => {
            const cellRef = cellXml.match(/\sr="([^"]+)"/)?.[1] || '';
            cells[columnNameToIndex(cellRef)] = getCellValue(cellXml, sharedStrings);
        });

        return {
            number: rowNumber,
            cells,
        };
    });
};

const normalizeHeader = (value) => (
    String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
);

const parseExcelRows = (fileBase64) => {
    if (!fileBase64) {
        const err = new Error('Debe seleccionar un archivo Excel');
        err.status = 400;
        throw err;
    }

    let zip;
    let sheetXml;
    let sharedStrings;

    try {
        const base64 = String(fileBase64).replace(/^data:.*?;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');
        zip = getZipEntries(buffer);
        sharedStrings = parseSharedStrings(zip.read('xl/sharedStrings.xml'));
        sheetXml = zip.read(getFirstSheetPath(zip));
    } catch (error) {
        error.status = 400;
        throw error;
    }

    if (!sheetXml) {
        const err = new Error('El XLSX no contiene hojas validas');
        err.status = 400;
        throw err;
    }

    const parsedRows = parseRowsFromSheet(sheetXml, sharedStrings);
    const headerRow = parsedRows.find((row) => row.cells.some((value) => String(value || '').trim()));

    if (!headerRow) {
        const err = new Error("Falta la columna 'identificador'. El archivo debe contener: identificador, monto, descripcion");
        err.status = 400;
        throw err;
    }

    const headerMap = {};
    headerRow.cells.forEach((header, index) => {
        const normalized = normalizeHeader(header);
        if (REQUIRED_COLUMNS.includes(normalized)) {
            headerMap[normalized] = index;
        }
    });

    const missingColumn = REQUIRED_COLUMNS.find((column) => headerMap[column] === undefined);
    if (missingColumn) {
        const err = new Error(`Falta la columna '${missingColumn}'. El archivo debe contener: identificador, monto, descripcion`);
        err.status = 400;
        throw err;
    }

    const dataRows = parsedRows
        .filter((row) => row.number > headerRow.number)
        .filter((row) => REQUIRED_COLUMNS.some((column) => String(row.cells[headerMap[column]] || '').trim()));

    if (dataRows.length > MAX_ROWS) {
        const err = new Error(`El archivo supera el maximo de ${MAX_ROWS} filas permitido`);
        err.status = 400;
        throw err;
    }

    return dataRows.map((row) => ({
        fila: row.number,
        identificador: String(row.cells[headerMap.identificador] || '').trim(),
        monto: row.cells[headerMap.monto],
        descripcion: String(row.cells[headerMap.descripcion] || '').trim(),
    }));
};

const parseMonto = (value) => {
    if (value === null || value === undefined || String(value).trim() === '') return null;

    const textValue = String(value).trim().replace(',', '.');
    if (!/^-?\d+(\.\d+)?$/.test(textValue)) return null;

    const numberValue = Number(textValue);
    if (!Number.isFinite(numberValue)) return null;

    return numberValue;
};

const getActiveConfig = async (transaction = null) => {
    return ConfiguracionPuntos.findOne({
        where: { activo: true },
        order: [['fecha_creacion', 'DESC']],
        transaction,
    });
};

const calculatePoints = (monto, configuracion) => (
    Math.round((Number(monto) * Number(configuracion.puntos_base)) / Number(configuracion.monto_base))
);

const buildSummary = (rows) => ({
    totalFilas: rows.length,
    validas: rows.filter((row) => row.valido).length,
    invalidas: rows.filter((row) => !row.valido).length,
    puntosTotales: rows.reduce((total, row) => total + (row.valido ? Number(row.puntos || 0) : 0), 0),
});

const validateBulkRow = async (input, configuracion = null, transaction = null) => {
    const fila = Number(input.fila);
    const identificador = String(input.identificador || '').trim();
    const descripcion = String(input.descripcion || '').trim();
    const monto = parseMonto(input.monto);
    const activeConfig = configuracion || await getActiveConfig(transaction);

    const invalidRow = (error) => ({
        fila,
        identificador,
        cliente_id: null,
        cliente_nombre: '',
        monto: input.monto,
        puntos: 0,
        descripcion,
        valido: false,
        error,
    });

    if (!activeConfig) {
        return invalidRow('No existe una configuracion de puntos activa');
    }

    if (!identificador) {
        return invalidRow('El identificador es obligatorio');
    }

    if (monto === null) {
        return invalidRow('El monto debe ser numerico');
    }

    if (monto <= 0) {
        return invalidRow('El monto debe ser mayor a 0');
    }

    const cliente = await Cliente.findOne({
        where: { codigo_externo: identificador },
        transaction,
    });

    if (!cliente) {
        return invalidRow('Cliente no encontrado para el identificador');
    }

    const puntos = calculatePoints(monto, activeConfig);

    if (puntos <= 0) {
        return invalidRow('El monto ingresado no genera puntos');
    }

    return {
        fila,
        identificador,
        cliente_id: cliente.id,
        cliente_nombre: `${cliente.nombre} ${cliente.apellido}`,
        monto,
        puntos,
        descripcion,
        valido: true,
        error: '',
    };
};

const validateBulkRows = async (rows, transaction = null) => {
    if (rows.length > MAX_ROWS) {
        const err = new Error(`La carga supera el maximo de ${MAX_ROWS} filas permitido`);
        err.status = 400;
        throw err;
    }

    const configuracion = await getActiveConfig(transaction);
    const validatedRows = [];

    for (const row of rows) {
        validatedRows.push(await validateBulkRow(row, configuracion, transaction));
    }

    return {
        filas: validatedRows,
        resumen: buildSummary(validatedRows),
    };
};

const saveBulkRows = async ({ rows, usuarioId, transaction }) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        const err = new Error('No hay filas para confirmar');
        err.status = 400;
        throw err;
    }

    const validation = await validateBulkRows(rows, transaction);

    if (validation.resumen.invalidas > 0) {
        const err = new Error('Existen filas invalidas. Corregilas antes de confirmar la carga.');
        err.status = 400;
        err.validation = validation;
        throw err;
    }

    const configuracion = await getActiveConfig(transaction);

    try {
        const movimientos = await MovimientoPuntos.bulkCreate(
            validation.filas.map((row) => ({
                cliente_id: row.cliente_id,
                cantidad: row.puntos,
                tipo: 'CARGA',
                descripcion: row.descripcion || 'Carga masiva de puntos',
                creado_por: usuarioId,
                monto_compra: row.monto,
                configuracion_puntos_id: configuracion.id,
                beneficio_id: null,
            })),
            { transaction }
        );

        return {
            movimientosCreados: movimientos.length,
            puntosTotales: validation.resumen.puntosTotales,
        };
    } catch (err) {
        if (err instanceof ValidationError) {
            err.status = 400;
        }
        throw err;
    }
};

module.exports = {
    parseExcelRows,
    validateBulkRow,
    validateBulkRows,
    saveBulkRows,
    buildSummary,
};
