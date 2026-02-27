import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { InformesService } from '../../../../services/informes/informes.service';

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
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, DataZoomComponent, ToolboxComponent, CanvasRenderer]);

@Component({
  selector: 'app-chart-ingresos',
  imports: [NgxEchartsDirective],
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
      item.fechaRegistro,
      item.total,
    ]) ?? [];
    
    return {
      tooltip: {
        trigger: 'axis',
        position: (pt: number[]) => [pt[0], '10%'],
      },
      title: {
        left: 'center',
        text: 'Histórico de Ingresos',
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, false],
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
          symbol: 'none',
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
        },
      ],
    };
  });
}
