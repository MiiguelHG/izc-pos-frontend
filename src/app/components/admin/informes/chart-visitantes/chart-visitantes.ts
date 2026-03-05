import { ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import { InformesService } from '../../../../services/informes/informes.service';
import { Resumen } from "../resumen/resumen";

import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-chart-visitantes',
  imports: [NgxEchartsDirective, Resumen],
  templateUrl: './chart-visitantes.html',
  styleUrl: './chart-visitantes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({echarts})],
})
export class ChartVisitantes {
  private informeService = inject(InformesService);
  protected informe = this.informeService.informe;

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
              color: '#AD3232',
            },
            label: {
              formatter: 'min',
              color: '#802525',
              position: 'right',
            },
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      tooltip: {
        trigger: 'axis',
        position: (pt: number[]) => [pt[0], '10%'],
        // formatear para cuando los visitantes son 0 mostrar "sin Visitas"
        valueFormatter: (value: number) => {
          return value === 0 ? 'Sin visitas' : `${value}`;
        }
      },
      title: {
        left: 'center',
        text: 'Histórico de Visitantes',
      },
      xAxis: {
        type: 'category',
        name: 'Fecha',
        boundaryGap: false,
      },
      yAxis: {
        name: 'Total Visitantes',
        type: 'value',
        boundaryGap: [0, false],
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { start: 0, end: 100 },
      ],
      series: [
        {
          name: 'Visitantes',
          type: 'line',
          // smooth: true,
          // symbol: 'none',
          chartAnimationEasing: 'backIn',
          showSymbol: false,
          sampling: 'lttb',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.5)' }, // Azul con opacidad al inicio
              { offset: 1, color: 'rgba(84, 112, 198, 0)' },   // Transparente al final
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
}
