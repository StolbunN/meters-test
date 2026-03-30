import { cast, flow, types, type Instance } from 'mobx-state-tree';
import { getMeterType } from '../helpers/getMeterType';
import { formatDate } from '../helpers/formatDate';
import type { IAreaData } from '../interfaces/Area.interface';
import type { IMeterData } from '../interfaces/Meter.interface';

const Meter = types.model({
  id: types.identifier,
  area: types.model({
    id: types.identifier,
  }),
  brand_name: types.maybeNull(types.string),
  communication: types.string,
  description: types.string,
  initial_values: types.array(types.number),
  installation_date: types.string,
  is_automatic: types.maybeNull(types.boolean),
  model_name: types.maybeNull(types.string),
  serial_number: types.string,
  _type: types.array(types.string),
});

const Area = types.model('Area', {
  id: types.identifier,
  number: types.number,
  str_number: types.string,
  str_number_full: types.string,
  house: types.model({
    address: types.string,
    id: types.string,
    fias_addrobjs: types.array(types.string),
  }),
});

const RootStore = types
  .model({
    meters: types.array(Meter),
    areas: types.map(Area),
    limit: 20,
    offset: 0,
    loading: false,
    error: types.maybeNull(types.string),
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
  })
  .actions((self) => ({
    setLoading(loading: boolean) {
      self.loading = loading;
    },

    setError(error: string | null) {
      self.error = error;
    },

    fetchAreas: flow(function* () {
      const unknownAreaIds = self.meters
        .filter((m) => !self.areas.has(m.area.id))
        .map((m) => m.area.id);

      const uniqueIds = [...new Set(unknownAreaIds)];

      if (uniqueIds.length === 0) return;

      try {
        const promises: Promise<IAreaData>[] = uniqueIds.map((id) =>
          fetch(
            `https://showroom.eis24.me/c300/api/v4/test/areas/?id=${id}`
          ).then((data) => data.json())
        );

        const response: PromiseSettledResult<IAreaData>[] =
          yield Promise.allSettled(promises);

        response.forEach((res) => {
          if (res.status === 'fulfilled') {
            const area = res.value.results[0];
            self.areas.put(area);
          } else {
            throw new Error(`Ошибка: ${res.reason}`);
          }
        });
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : 'Неизвестная ошибка';
        console.error(errMsg);
      }
    }),
  }))
  .actions((self) => ({
    fetchMeters: flow(function* () {
      self.setLoading(true);
      self.setError(null);
      try {
        const response: Response = yield fetch(
          `https://showroom.eis24.me/c300/api/v4/test/meters/?limit=${self.limit}&offset=${(self.currentPage - 1) * self.limit}`
        );

        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status}`);
        }

        const data: IMeterData = yield response.json();
        self.meters = cast(data.results || []);
        self.totalCount = data.count;
        self.totalPages = Math.ceil(self.totalCount / self.limit);

        yield self.fetchAreas();
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : 'Неизвестная ошибка';
        console.error(errMsg);
      } finally {
        self.setLoading(false);
      }
    }),

    deleteMeter: flow(function* (meterId: string) {
      try {
        // ! ИЗ-ЗА CORS НЕ ПОЛУЧИЛОСЬ ОТПРАВИТЬ ЗАПРОС
        // ! СДЕЛАЛ ТОЛЬКО ИЗМЕНЕНИЯ НА КЛИЕНТЕ
        
        // const response = yield fetch(
        //   `http://showroom.eis24.me/c300/api/v4/test/meters/${meterId}`,
        //   {
        //     method: 'DELETE',
        //   }
        // );

        // if (!response.ok) {
        //   throw new Error(`Ошибка: ${response.status}`);
        // }

        const filteredMeters = self.meters.filter((m) => m.id !== meterId);
        self.meters.replace(filteredMeters);

        const nextItemOffset = self.offset + self.limit + 1;
        const refillResponse = yield fetch(
          `https://showroom.eis24.me/c300/api/v4/test/meters/?limit=1&offset=${nextItemOffset}`
        );

        if (refillResponse.ok) {
          const data = yield refillResponse.json();
          self.meters.push(data.results[0]);

          yield self.fetchAreas();
        }

        console.log(self.meters);
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : 'Неизвестная ошибка';
        console.error(errMsg);
      }
    }),
  }))
  .actions((self) => ({
    setPage: flow(function* (page: number) {
      if (page >= 1 && page <= self.totalPages && page !== self.currentPage) {
        self.currentPage = page;
        yield self.fetchMeters();
      }
    }),
  }))
  .views((self) => ({
    get formattedMeters() {
      return self.meters.map((meter, index) => {
        const meterType = getMeterType(meter._type[0]);
        const installationDate = formatDate(meter.installation_date);
        const isAutomatic = meter.is_automatic ? 'да' : 'нет';
        const initialValues = meter.initial_values.at(-1);
        const area = self.areas.get(meter.area.id);
        const address = area
          ? `${area.house.address}, ${area.str_number_full || `кв. ${area.str_number}`}`
          : 'Загрузка...';
        return {
          ...meter,
          index: self.limit * (self.currentPage -1 ) + index + 1,
          meterType,
          installationDate,
          isAutomatic,
          initialValues,
          address,
          description: meter.description,
        };
      });
    },
  }));

export type IMetersStore = Instance<typeof RootStore>;

let rootStore: IMetersStore;
export const useStore = () => {
  if (!rootStore) {
    rootStore = RootStore.create({
      meters: [],
      areas: {},
      offset: 0,
      limit: 20,
      loading: false,
      error: null,
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
    });
  }
  return rootStore;
};
