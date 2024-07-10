import { Component, AfterViewInit } from '@angular/core';
import { StatsService } from "../../../services/stats-service.service";
import { Corte } from "../../../models/carne";

declare var google: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  title1 = 'Gráfico de Cortes de Pollo';
  title2 = 'Gráfico de Cortes de Vacuno';
  title3 = 'Gráfico de Cortes de Cerdo';

  constructor(private statsService: StatsService) {}

  ngAfterViewInit() {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      this.drawChartPollo();
      this.drawChartVacuno();
      this.drawChartCerdo();
    });
  }

  drawChartPollo() {
    this.statsService.getCarneCortes('pollo').subscribe(
      (cortes: Corte[]) => {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Nombre');
        data.addColumn('number', 'Precio por Kilo');

        cortes.forEach((corte: Corte) => {
          data.addRow([corte.nombre, Number(corte.precioPorKilo)]);
        });

        const options = {
          title: 'Cortes de Pollo - Precio por Kilo',
          pieHole: 0.4,
        };

        const chart = new google.visualization.PieChart(document.getElementById('pollo'));
        chart.draw(data, options);
      },
      (error) => {
        console.error('Error al obtener cortes de carne:', error);
      }
    );
  }

  drawChartVacuno() {
    this.statsService.getCarneCortes('vacuno').subscribe(
      (cortes: Corte[]) => {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Nombre');
        data.addColumn('number', 'Precio por Kilo');

        cortes.forEach((corte: Corte) => {
          data.addRow([corte.nombre, Number(corte.precioPorKilo)]);
        });

        const options = {
          title: 'Cortes de Vacuno - Precio por Kilo',
          pieHole: 0.4,
        };

        const chart = new google.visualization.PieChart(document.getElementById('vacuno'));
        chart.draw(data, options);
      },
      (error) => {
        console.error('Error al obtener cortes de carne:', error);
      }
    );
  }

  drawChartCerdo() {
    this.statsService.getCarneCortes('cerdo').subscribe(
      (cortes: Corte[]) => {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Nombre');
        data.addColumn('number', 'Precio por Kilo');

        cortes.forEach((corte: Corte) => {
          data.addRow([corte.nombre, Number(corte.precioPorKilo)]);
        });

        const options = {
          title: 'Cortes de Cerdo - Precio por Kilo',
          pieHole: 0.4,
        };

        const chart = new google.visualization.PieChart(document.getElementById('cerdo'));
        chart.draw(data, options);
      },
      (error) => {
        console.error('Error al obtener cortes de carne:', error);
      }
    );
  }
}
