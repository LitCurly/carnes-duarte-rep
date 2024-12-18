import { Component, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StatsService } from '../../../services/stats-service.service';
import { Corte } from '../../../models/carne';
import { Order } from '../../../models/order';

declare var google: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  titles = {
    pollo: 'Gráfico de Cortes de Pollo',
    vacuno: 'Gráfico de Cortes de Vacuno',
    cerdo: 'Gráfico de Cortes de Cerdo',
    totalOrders: 'Gráfico del Número Total de Pedidos',
    ordersByMonth: 'Pedidos por Mes'
  };

  constructor(private statsService: StatsService) { }

  ngAfterViewInit() {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      this.drawChart('pollo', this.statsService.getCarneCortes('pollo'), this.titles.pollo);
      this.drawChart('vacuno', this.statsService.getCarneCortes('vacuno'), this.titles.vacuno);
      this.drawChart('cerdo', this.statsService.getCarneCortes('cerdo'), this.titles.cerdo);

      this.statsService.getAllOrders().subscribe(
        (orders: Order[]) => {
          this.drawTotalOrdersChart('totalOrders', orders, this.titles.totalOrders);
          this.drawOrdersByMonthChart('ordersByMonth', orders, this.titles.ordersByMonth);
          this.drawMostPurchasedMeatChart('mostPurchasedMeatChart', orders, 'Cortes de carne más comprados');
          this.drawMostPurchasedCutsChart('mostPurchasedCutsChart', orders, 'Tipos de cortes más comprados');
        },
        (error) => {
          console.error('Error al obtener todas las órdenes:', error);
        }
      );
    });
  }

  private prepareChartData(orders: Order[]): [string, number][] {
    const groupedData = new Map<string, number>();

    orders.forEach(order => {
      let createdAt: string;

      if (order.createdAt instanceof Date) {
        createdAt = order.createdAt.toISOString().split('T')[0];
      } else {
        console.error('Error: Invalid createdAt value:', order.createdAt);
        return;
      }

      if (groupedData.has(createdAt)) {
        groupedData.set(createdAt, groupedData.get(createdAt)! + 1);
      } else {
        groupedData.set(createdAt, 1);
      }
    });

    const chartData: [string, number][] = [];
    groupedData.forEach((value, key) => {
      chartData.push([key, value]);
    });

    chartData.sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    return chartData;
  }

  private drawChart(chartId: string, dataObservable: Observable<Corte[]>, title: string) {
    dataObservable.subscribe(
      (data: Corte[]) => {
        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Nombre');
        dataTable.addColumn('number', 'Precio por Kilo');

        data.forEach((corte: Corte) => {
          dataTable.addRow([corte.nombre, Number(corte.precioPorKilo)]);
        });

        const options = {
          title: title,
          pieHole: 0.4,
        };

        const chart = new google.visualization.PieChart(document.getElementById(chartId));
        chart.draw(dataTable, options);
      },
      (error) => {
        console.error(`Error al obtener datos para el gráfico ${title}:`, error);
      }
    );
  }

  private drawTotalOrdersChart(chartId: string, orders: Order[], title: string) {
    const chartData = this.prepareChartData(orders);

    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Fecha');
    dataTable.addColumn('number', 'Cantidad de Órdenes');

    chartData.forEach(dataPoint => {
      dataTable.addRow(dataPoint);
    });

    const options = {
      title: title,
      legend: { position: 'none' },
      bars: 'vertical',
      height: 250,
      colors: ['#cb0101'],
      bar: {
        groupWidth: '30%',
      },
      chartArea: {
        width: '60%', // Ajustar el ancho del área del gráfico
        height: '70%',
        left: 60,
      },
      hAxis: {
        title: 'Fecha',
        slantedText: true,
        slantedTextAngle: 45,
      },
      vAxis: {
        title: 'Cantidad de Órdenes',
        textStyle: {
          fontSize: 12
        },
      },
    };

    const chart = new google.visualization.ColumnChart(document.getElementById(chartId));
    chart.draw(dataTable, options);
  }

  private drawOrdersByMonthChart(chartId: string, orders: Order[], title: string) {
    // Obtener todos los meses del año actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Crear un mapa con todos los meses del año actual inicializados a 0 órdenes
    const groupedData = new Map<string, number>();
    months.forEach(month => {
      groupedData.set(`${month} ${currentYear}`, 0);
    });

    // Contar las órdenes por mes
    orders.forEach(order => {
      const createdAt = new Date(order.createdAt);
      const monthYear = `${months[createdAt.getMonth()]} ${createdAt.getFullYear()}`;
      groupedData.set(monthYear, groupedData.get(monthYear)! + 1);
    });

    // Convertir los datos del mapa a un array de [mes, cantidad]
    const chartData: [string, number][] = [];
    groupedData.forEach((value, key) => {
      chartData.push([key, value]);
    });

    // Ordenar por mes cronológicamente
    chartData.sort((a, b) => {
      const monthA = months.indexOf(a[0].split(' ')[0]);
      const monthB = months.indexOf(b[0].split(' ')[0]);
      const yearA = parseInt(a[0].split(' ')[1]);
      const yearB = parseInt(b[0].split(' ')[1]);

      if (yearA === yearB) {
        return monthA - monthB;
      } else {
        return yearA - yearB;
      }
    });

    // Crear DataTable para el gráfico
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Mes');
    dataTable.addColumn('number', 'Cantidad de Órdenes');
    chartData.forEach(dataPoint => {
      dataTable.addRow(dataPoint);
    });

    // Opciones del gráfico
    const options = {
      title: title,
      legend: { position: 'none' },
      bars: 'vertical',
      height: 250,
      colors: ['#4CAF50'], // Color verde para el gráfico de barras de órdenes por mes
      bar: {
        groupWidth: '30%',
      },
      chartArea: {
        width: '60%', // Ajustar el ancho del área del gráfico
        height: '70%',
        left: 60,
      },
      hAxis: {
        title: 'Mes',
        slantedText: true,
        slantedTextAngle: 45,
        // Ajustar el margen y el tamaño del área del gráfico para mostrar los meses verticalmente
        textStyle: {
          fontSize: 12,
          bold: true,
          italic: false,
          color: '#4d4d4d',
          auraColor: 'none'
        },
        // Usar un margen y tamaño de área de gráfico mayores para ajustar la orientación vertical de los meses
        chartArea: {
          left: 80, // Ajustar el margen izquierdo para espacio adicional
          width: '50%', // Reducir el ancho del área del gráfico para acomodar etiquetas verticales
        }
      },
      vAxis: {
        title: 'Cantidad de Órdenes',
        textStyle: {
          fontSize: 12
        },
      },
    };

    // Dibujar el gráfico de columnas
    const chart = new google.visualization.ColumnChart(document.getElementById(chartId));
    chart.draw(dataTable, options);
  }

  private drawMostPurchasedMeatChart(chartId: string, orders: Order[], title: string) {
    const meatCounts = this.statsService.getMostPurchasedMeat(orders);
    const chartData: [string, number][] = Object.entries(meatCounts);

    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Corte de Carne');
    dataTable.addColumn('number', 'Cantidad');

    chartData.forEach(([nombre, cantidad]) => {
      dataTable.addRow([nombre, cantidad]);
    });

    const options = {
      title: title,
      pieHole: 0.4,
      is3D: false,
      colors: ['#FF9999', '#66B2FF', '#99FF99', '#FFCC99', '#C299FF'],
      chartArea: {
        width: '90%',
        height: '90%',
      },
    };

    const chart = new google.visualization.PieChart(document.getElementById(chartId));
    chart.draw(dataTable, options);
  }

  private drawMostPurchasedCutsChart(chartId: string, orders: Order[], title: string) {
    const cutCounts = this.statsService.getMostPurchasedCuts(orders);
    const chartData: [string, number][] = Object.entries(cutCounts);

    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Tipo de Corte');
    dataTable.addColumn('number', 'Cantidad Vendida');
    chartData.forEach(([cut, count]) => {
      dataTable.addRow([cut, count]);
    });

    const options = {
      title: title,
      pieHole: 0.4,
      colors: ['#FF9999', '#66B2FF', '#99FF99'],
    };

    const chart = new google.visualization.PieChart(document.getElementById(chartId));
    chart.draw(dataTable, options);
  }
}
