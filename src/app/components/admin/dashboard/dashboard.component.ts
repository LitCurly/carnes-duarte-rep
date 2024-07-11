import { Component, AfterViewInit } from '@angular/core';
import { Observable, of } from 'rxjs'; // Importa 'of' desde rxjs
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
    totalOrders: 'Gráfico del Número Total de Órdenes'
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
          const totalOrders = orders.length; // Obtener el número total de órdenes
          this.drawTotalOrdersChart('totalOrders', of(totalOrders), this.titles.totalOrders); // Usar 'of' en lugar de Observable.of
        },
        (error) => {
          console.error('Error al obtener todas las órdenes:', error);
        }
      );
    });
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

  private drawTotalOrdersChart(chartId: string, dataObservable: Observable<number>, title: string) {
    dataObservable.subscribe(
      (totalOrders: number) => {
        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Descripción');
        dataTable.addColumn('number', 'Cantidad');
        dataTable.addRow(['Total de Órdenes', totalOrders]);

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
}
