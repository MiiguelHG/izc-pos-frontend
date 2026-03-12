import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { InformesService } from '../../../../services/informes/informes.service';

import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { LineChart,} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Resumen } from "../resumen/resumen";

echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, DataZoomComponent, ToolboxComponent, CanvasRenderer]);

@Component({
  selector: 'app-chart-ingresos',
  imports: [NgxEchartsDirective, Resumen],
  templateUrl: './chart-ingresos.html',
  styleUrl: './chart-ingresos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({echarts})],
})
export class ChartIngresos {
  private informeService = inject(InformesService);
  protected informe = this.informeService.informeIngresos;

  protected readonly options = computed<EChartsCoreOption>(() => {
    const raw = this.informe()?.data?.data;
    const data = raw?.map(item => [
      item.fecha,
      item.total,
    ]) ?? [];

    const media = this.informe()?.data?.resumen?.promedio;
    const minDate = this.informe()?.data?.resumen?.fechaMinimo;
    const valorMinimo = this.informe()?.data?.resumen?.minimo;
    const maxDate = this.informe()?.data?.resumen?.fechaMaximo;

    const markLineData = [
      media !== undefined
        ? {
            name: 'Promedio',
            yAxis: media,
            lineStyle: { color: 'rgba(84, 112, 198, 0.35)', type: 'dashed', width: 2 },
            label: { formatter: 'avg', color: 'rgba(75, 172, 198, 0.8)' },
          }
        : null,
      maxDate
        ? {
            name: 'Máximo',
            xAxis: maxDate,
            lineStyle: { color: '#17853F', type: 'dashed', width: 2 },
            label: { formatter: 'max', color: '#17853F' },
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null);

    const markPointData = [
      minDate && valorMinimo !== undefined
        ? {
            name: 'Mínimo',
            coord: [minDate, valorMinimo],
            symbol: 'circle',
            symbolSize: 10,
            itemStyle: {
              color: '#DC2626',
            },
            label: {
              formatter: 'min',
              color: '#DC2626',
              position: 'right',
            },
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null);

    const currencyFormatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return {
      tooltip: {
        trigger: 'axis',
        position: (pt: number[]) => [pt[0], '10%'],
        valueFormatter: (value: number) => {
          return value > 0 ? currencyFormatter.format(value) : 'sin Ingresos';
        },
      },
      title: {
        left: 'center',
        text: 'Histórico de Ingresos',
      },
      xAxis: {
        type: 'category',
        name: 'Fecha',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: 'Total Ingresos',
        boundaryGap: [0, false],
        axisLine: {
          show: true,
          symbol: ['none', 'arrow'],
          symbolSize: [8, 12],
          lineStyle: {
            color: '#374151',
            width: 1,
          }
        },
        axisLabel: {
          formatter: (value: number) => currencyFormatter.format(value),
        },
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { start: 0, end: 100 },
      ],
      series: [
        {
          name: 'Ingresos',
          type: 'line',
          // smooth: true,
          // symbol: 'circle',
          animationEasing: 'backIn',
          showSymbol: false,
          sampling: 'lttb',
          itemStyle: {
            color: '#10B981', // Verde
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.5)' }, // Verde con opacidad al inicio
              { offset: 1, color: 'rgba(16, 185, 129, 0)' },   // Transparente al final
            ])
          },
          data,
          markLine: {
            symbol: ['none', 'none'],
            label: {
              position: 'insideEndTop',
            },
            data: markLineData,
          },
          markPoint: {
            data: markPointData,
          },
        },
      ],
    };
  });

  // quarticIn(k: number) {
  //   return k * k * k * k;
  // }
}
