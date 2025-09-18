// src/services/ExcelService.js
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ExcelService = {
  // Exportar registros a Excel
  exportRecords: async (records, fileName = null) => {
    try {
      // Preparar datos con el formato exacto de los campos requeridos
      const excelData = records.map(record => ({
        'NOMBRE': record.nombre || '',
        'VEHICULO': record.vehiculo || '',
        'FECHA': record.fecha || '',
        'HORA INGRESO': record.horaIngreso || '',
        // Requisado Ingreso
        'ESPEJO (INGRESO)': record.requisadoIngreso?.espejo || '',
        'BODEGA (INGRESO)': record.requisadoIngreso?.bodega || '',
        'INTERIOR (INGRESO)': record.requisadoIngreso?.interior || '',
        'GUARDA (INGRESO)': record.requisadoIngreso?.guarda || '',
        // Requisado Salida
        'HORA SALIDA': record.horaSalida || '',
        'ESPEJO (SALIDA)': record.requisadoSalida?.espejo || '',
        'BODEGA (SALIDA)': record.requisadoSalida?.bodega || '',
        'INTERIOR (SALIDA)': record.requisadoSalida?.interior || '',
        'GUARDA (SALIDA)': record.requisadoSalida?.guarda || '',
      }));

      // Crear hoja de cálculo
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar anchos de columna
      const colWidths = [
        { wch: 25 }, // NOMBRE
        { wch: 15 }, // VEHICULO
        { wch: 12 }, // FECHA
        { wch: 12 }, // HORA INGRESO
        { wch: 15 }, // ESPEJO (INGRESO)
        { wch: 15 }, // BODEGA (INGRESO)
        { wch: 15 }, // INTERIOR (INGRESO)
        { wch: 20 }, // GUARDA (INGRESO)
        { wch: 12 }, // HORA SALIDA
        { wch: 15 }, // ESPEJO (SALIDA)
        { wch: 15 }, // BODEGA (SALIDA)
        { wch: 15 }, // INTERIOR (SALIDA)
        { wch: 20 }, // GUARDA (SALIDA)
      ];
      ws['!cols'] = colWidths;

      // Crear libro
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Control Vehicular');

      // Agregar hoja de resumen si hay registros
      if (records.length > 0) {
        const summary = ExcelService.createSummarySheet(records);
        XLSX.utils.book_append_sheet(wb, summary, 'Resumen');
      }

      // Generar archivo binario
      const wbout = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
      });

      // Nombre del archivo
      const defaultFileName = `Control_Vehicular_${format(new Date(), 'dd_MM_yyyy_HHmm')}.xlsx`;
      const finalFileName = fileName || defaultFileName;
      
      // Guardar archivo
      const fileUri = `${FileSystem.documentDirectory}${finalFileName}`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return fileUri;
    } catch (error) {
      console.error('Error creando archivo Excel:', error);
      throw error;
    }
  },

  // Crear hoja de resumen
  createSummarySheet: (records) => {
    const totalEntries = records.length;
    const completedExits = records.filter(r => r.horaSalida).length;
    const pendingExits = totalEntries - completedExits;
    
    // Contar inspecciones con problemas
    const entriesWithIssues = records.filter(r => 
      r.requisadoIngreso?.espejo === 'no' ||
      r.requisadoIngreso?.bodega === 'no' ||
      r.requisadoIngreso?.interior === 'no'
    ).length;
    
    const exitsWithIssues = records.filter(r => 
      r.horaSalida && (
        r.requisadoSalida?.espejo === 'no' ||
        r.requisadoSalida?.bodega === 'no' ||
        r.requisadoSalida?.interior === 'no'
      )
    ).length;

    // Estadísticas por persona
    const personStats = {};
    records.forEach(record => {
      if (!personStats[record.nombre]) {
        personStats[record.nombre] = {
          nombre: record.nombre,
          entradas: 0,
          salidas: 0,
          vehiculos: new Set(),
        };
      }
      personStats[record.nombre].entradas++;
      if (record.horaSalida) {
        personStats[record.nombre].salidas++;
      }
      personStats[record.nombre].vehiculos.add(record.vehiculo);
    });

    const summaryData = [
      { 'Concepto': 'RESUMEN GENERAL', 'Valor': '' },
      { 'Concepto': 'Total de Entradas', 'Valor': totalEntries },
      { 'Concepto': 'Total de Salidas', 'Valor': completedExits },
      { 'Concepto': 'Salidas Pendientes', 'Valor': pendingExits },
      { 'Concepto': 'Inspecciones con Problemas (Entrada)', 'Valor': entriesWithIssues },
      { 'Concepto': 'Inspecciones con Problemas (Salida)', 'Valor': exitsWithIssues },
      { 'Concepto': '', 'Valor': '' },
      { 'Concepto': 'ESTADÍSTICAS POR PERSONA', 'Valor': '' },
      ...Object.values(personStats).map(stat => ({
        'Concepto': stat.nombre,
        'Valor': `${stat.entradas} entradas, ${stat.salidas} salidas, ${stat.vehiculos.size} vehículo(s)`,
      })),
    ];

    return XLSX.utils.json_to_sheet(summaryData);
  },

  // Compartir archivo Excel
  shareExcel: async (fileUri) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Compartir no está disponible en este dispositivo');
      }
      await Sharing.shareAsync(fileUri);
      return true;
    } catch (error) {
      console.error('Error compartiendo archivo:', error);
      throw error;
    }
  },

  // Importar archivo Excel
  importExcel: async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') {
        return null;
      }

      const fileContent = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const wb = XLSX.read(fileContent, { type: 'base64' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Transformar datos al formato interno
      const records = data.map((row, index) => ({
        id: Date.now() + index,
        nombre: row['NOMBRE'] || '',
        vehiculo: row['VEHICULO'] || '',
        fecha: row['FECHA'] || '',
        horaIngreso: row['HORA INGRESO'] || '',
        requisadoIngreso: {
          espejo: row['ESPEJO (INGRESO)'] || null,
          bodega: row['BODEGA (INGRESO)'] || null,
          interior: row['INTERIOR (INGRESO)'] || null,
          guarda: row['GUARDA (INGRESO)'] || '',
        },
        horaSalida: row['HORA SALIDA'] || '',
        requisadoSalida: {
          espejo: row['ESPEJO (SALIDA)'] || null,
          bodega: row['BODEGA (SALIDA)'] || null,
          interior: row['INTERIOR (SALIDA)'] || null,
          guarda: row['GUARDA (SALIDA)'] || '',
        },
      }));

      return records;
    } catch (error) {
      console.error('Error importando Excel:', error);
      throw error;
    }
  },

  // Exportar y compartir
  exportAndShare: async (records, fileName = null) => {
    try {
      const fileUri = await ExcelService.exportRecords(records, fileName);
      await ExcelService.shareExcel(fileUri);
      return true;
    } catch (error) {
      console.error('Error en exportar y compartir:', error);
      throw error;
    }
  },
};

export default ExcelService;