import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FileOpener } from '@capacitor-community/file-opener';
import { GroceryList } from '../database/collections/grocery-list';
import { WeightType } from '../database/enums/weight-type';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  private listenerInitialized = false;

  constructor() {
    this.initNotificationListener();
  }

  private initNotificationListener(): void {
    if (Capacitor.isNativePlatform() && !this.listenerInitialized) {
      this.listenerInitialized = true;
      LocalNotifications.addListener('localNotificationActionPerformed', async (action) => {
        const fileUri = action.notification.extra?.fileUri;
        if (fileUri) {
          try {
            await FileOpener.open({
              filePath: fileUri,
              contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              openWithDefault: false,
            });
          } catch (error) {
            console.error('Error opening file from notification:', error);
          }
        }
      });
    }
  }

  async exportGroceryLists(lists: GroceryList[], fileNamePrefix = 'historial_mercados'): Promise<void> {
    if (!lists || lists.length === 0) return;

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    // 1. Hoja de Resumen General de todos los mercados
    const summaryData: any[][] = [
      ['RESUMEN HISTÓRICO DE MERCADOS'],
      [],
      [
        'N°',
        'Fecha',
        'Descripción',
        'Cantidad Productos',
        'Tasa BCV (Bs)',
        'Tasa Kontigo (Bs)',
        'Subtotal ($)',
        'Total IVA ($)',
        'Total ($)',
        'Total Bs (BCV)',
        'Total $ (Kontigo)',
      ],
    ];

    lists.forEach((list, index) => {
      const dateFormatted = list.createdAt ? new Date(list.createdAt).toLocaleString() : '';
      const itemsCount = list.items ? list.items.length : list.itemIds?.length || 0;

      summaryData.push([
        index + 1,
        dateFormatted,
        list.description || 'Mercado',
        itemsCount,
        Number(list.bcvRate?.toFixed(2) || 0),
        Number(list.kontigoRate?.toFixed(2) || 0),
        Number(list.subtotalInDollars?.toFixed(2) || 0),
        Number(list.totalIVA?.toFixed(2) || 0),
        Number(list.totalInDollars?.toFixed(2) || 0),
        Number(list.bsTotalBCV?.toFixed(2) || 0),
        Number(list.dollarsTotalKontigo?.toFixed(2) || 0),
      ]);
    });

    const summarySheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 25 },
      { wch: 18 },
      { wch: 15 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen General');

    // 2. Una página / pestaña por cada mercado
    lists.forEach((list, index) => {
      const dateFormatted = list.createdAt ? new Date(list.createdAt).toLocaleString() : '';
      const dateShort = list.createdAt
        ? new Date(list.createdAt).toISOString().slice(0, 10)
        : '';
      const bcv = list.bcvRate || 0;

      const sheetData: any[][] = [
        ['INFORMACIÓN DEL MERCADO'],
        ['Descripción:', list.description || 'Mercado'],
        ['Fecha:', dateFormatted],
        ['Tasa BCV (Bs):', Number(list.bcvRate?.toFixed(2) || 0)],
        ['Tasa Kontigo (Bs):', Number(list.kontigoRate?.toFixed(2) || 0)],
        [],
        ['DETALLE DE PRODUCTOS'],
        [
          'Producto',
          'Cantidad',
          'Peso',
          'Unidad Peso',
          'Tipo IVA',
          'Precio Base ($)',
          'Precio Base (Bs)',
          'Total ($)',
          'Total (Bs)',
        ],
      ];

      if (list.items && list.items.length > 0) {
        list.items.forEach((item) => {
          const weightUnit =
            item.weight > 0 ? (item.wieghtType === WeightType.GR ? 'g' : 'Kg') : '';
          const basePriceUSD = item.price || 0;
          const basePriceBS = basePriceUSD * bcv;
          const totalUSD = item.totalInDollars || 0;
          const totalBS = totalUSD * bcv;

          sheetData.push([
            item.description,
            item.quantity,
            item.weight > 0 ? item.weight : '',
            weightUnit,
            item.IVAType,
            Number(basePriceUSD.toFixed(2)),
            Number(basePriceBS.toFixed(2)),
            Number(totalUSD.toFixed(2)),
            Number(totalBS.toFixed(2)),
          ]);
        });
      } else {
        sheetData.push(['No hay productos registrados en este mercado']);
      }

      sheetData.push([]);
      sheetData.push(['TOTALES DEL MERCADO']);
      sheetData.push([
        'Subtotal ($):',
        Number(list.subtotalInDollars?.toFixed(2) || 0),
        '',
        'Subtotal (Bs):',
        Number(((list.subtotalInDollars || 0) * bcv).toFixed(2)),
      ]);
      sheetData.push([
        'Total IVA ($):',
        Number(list.totalIVA?.toFixed(2) || 0),
        '',
        'Total IVA (Bs):',
        Number(((list.totalIVA || 0) * bcv).toFixed(2)),
      ]);
      sheetData.push([
        'Total General ($):',
        Number(list.totalInDollars?.toFixed(2) || 0),
        '',
        'Total General (Bs):',
        Number(list.bsTotalBCV?.toFixed(2) || 0),
      ]);
      sheetData.push(['Total Bs (BCV a pagar):', Number(list.bsTotalBCV?.toFixed(2) || 0)]);
      sheetData.push(['Total $ (Kontigo a pagar):', Number(list.dollarsTotalKontigo?.toFixed(2) || 0)]);

      const sheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);
      sheet['!cols'] = [
        { wch: 25 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
      ];

      // Nombre de la hoja (máx 31 caracteres, sin caracteres no permitidos)
      const sanitizedDesc = (list.description || 'Mercado').replace(/[:\\/?*\[\]]/g, '').trim();
      const sheetName = `${index + 1}. ${sanitizedDesc} (${dateShort})`.slice(0, 31);

      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    });

    // 3. Descargar o guardar archivo
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `${fileNamePrefix}_${today}.xlsx`;

    if (!Capacitor.isNativePlatform()) {
      // 3a. Plataforma Web
      XLSX.writeFile(workbook, fileName);
    } else {
      // 3b. Dispositivo Móvil
      try {
        const base64Data = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });

        // Notificación local
        try {
          const permStatus = await LocalNotifications.checkPermissions();
          if (permStatus.display !== 'granted') {
            await LocalNotifications.requestPermissions();
          }

          const notificationId = Math.floor(Math.random() * 1000000);
          await LocalNotifications.schedule({
            notifications: [
              {
                id: notificationId,
                title: 'Excel generado con éxito',
                body: `Toca aquí para abrir o compartir ${fileName}`,
                extra: {
                  fileUri: savedFile.uri,
                  fileName: fileName,
                },
                schedule: { at: new Date(Date.now() + 100) },
              },
            ],
          });
        } catch (notifErr) {
          console.warn('Notification error or permission denied:', notifErr);
        }

        // Abrir el archivo directamente con la app de hojas de cálculo del sistema
        try {
          await FileOpener.open({
            filePath: savedFile.uri,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            openWithDefault: false,
          });
        } catch (openErr) {
          console.log('Error opening file or no viewer app installed:', openErr);
        }
      } catch (error) {
        console.error('Error saving excel on mobile:', error);
        XLSX.writeFile(workbook, fileName);
      }
    }
  }
}

