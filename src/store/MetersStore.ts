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

    fetchAreas: flow(function* (areasIds: string[]) {

      const searchParams = new URLSearchParams();
      areasIds.forEach(id => searchParams.append("id__in", id));

      try {
        const response: Response = yield fetch(`https://showroom.eis24.me/c300/api/v4/test/areas/?${searchParams}`);

        if(!response.ok) throw new Error("Адреса не найдены");

        const data: IAreaData = yield response.json();

        if(data.results) {
          data.results.forEach(area => {
            self.areas.put(area);
          })
        }
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

        const unknownAreaIds = self.meters
          .filter(m => !self.areas.has(m.area.id))
          .map(m => m.area.id);

        const uniqueIds = Array.from(new Set([...unknownAreaIds]));

        if(uniqueIds.length > 0) {
          yield self.fetchAreas(uniqueIds);
        }
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

        const needed = self.limit - self.meters.length;
        const nextItemOffset = self.currentPage + self.limit + 1;
        const response: Response = yield fetch(
          `https://showroom.eis24.me/c300/api/v4/test/meters/?limit=${needed}&offset=${nextItemOffset}`
        );

        if (!response.ok) throw new Error("Счетчик не найден");

        const data: IMeterData = yield response.json();
        data.results.forEach(m => self.meters.push(m));


        const newUnknownAreaIds = self.meters
          .filter(m => !self.areas.has(m.area.id))
          .map(m => m.area.id);

        const newUniqueIds = Array.from(new Set([...newUnknownAreaIds]))
        if(newUniqueIds.length > 0) {
          yield self.fetchAreas(Array.from(newUniqueIds));
        }
        
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
          index: self.limit * (self.currentPage - 1) + index + 1,
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
