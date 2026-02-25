import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
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
import { Visitante } from '../../../../interfaces/visitante.interface';

echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, DataZoomComponent, ToolboxComponent, CanvasRenderer]);

@Component({
  selector: 'app-chart-visitantes',
  imports: [NgxEchartsDirective],
  templateUrl: './chart-visitantes.html',
  styleUrl: './chart-visitantes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({echarts})],
})
export class ChartVisitantes {
  private informeService = inject(InformesService);
  protected informe = this.informeService.informe;

  generoValue = input<'masculino' | 'femenino' | 'otro' | ''>('');

  protected readonly options = computed<EChartsCoreOption>(() => {
    const raw = this.informe()?.data?.data;
    const informeData = (Array.isArray(raw) ? raw : raw ? [raw] : []) as Visitante[];

    const groupedByDate = informeData.reduce((acc, item: Visitante) => {
      const dateKey = item.fechaRegistro;
      if (!dateKey) return acc;

      const currentValue =
        this.generoValue() === 'masculino' ? (item.cantidadHombres ?? 0) :
        this.generoValue() === 'femenino' ? (item.cantidadMujeres ?? 0) :
        this.generoValue() === 'otro' ? (item.cantidadOtros ?? 0) :
        (item.totalVisitantes ?? 0);

      acc.set(dateKey, (acc.get(dateKey) ?? 0) + currentValue);
      return acc;
    }, new Map<string, number>());

    const data = Array.from(groupedByDate.entries()).map(([fechaRegistro, total]) => [
      fechaRegistro,
      total,
    ]);

    return {
      tooltip: {
        trigger: 'axis',
        position: (pt: number[]) => [pt[0], '10%'],
      },
      title: {
        left: 'center',
        text: 'Histórico de Visitantes',
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
          name: 'Visitantes',
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'lttb',
          areaStyle: {},
          data,
        },
      ],
    };
  });

  // Solo actualiza la serie con [merge] en lugar de reemplazar todo el objeto options
  // protected mergeOptions = signal<EChartsCoreOption | null>(null);

  // constructor() {

  //   effect(() => {
  //     const informeData = this.informe()?.data?.data;
  //     if (!informeData) {
  //       return;
  //     }

  //     const data = (Array.isArray(informeData) ? informeData : [informeData]) as Visitante[];

  //     this.mergeOptions.set({
  //       series: [
  //         {
  //           data: data.map((item: Visitante) => [
  //             item.fechaRegistro,
  //             item.totalVisitantes!,
  //           ]),
  //         },
  //       ],
  //     });
  //   });
  // }
  //------------------------------------------------------------------------------------

  
}
