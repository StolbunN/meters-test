import { observer } from 'mobx-react-lite';
import { Button } from '../ui/Button/Button';
import { Icon } from '../ui/Icon/Icon';
import { tableColumns } from './tableColumns';
import { useStore } from '../../store/MetersStore';
import { Pagination } from '../Pagination/Pagination';
export const MetersTable = observer(() => {
  const rootStore = useStore();
  return (
    <section className="border border-(--border) rounded-xl overflow-hidden">
      <div className="h-140 overflow-y-auto">
        <table>
          <colgroup>
            <col className="w-12" />
            <col className="w-30" />
            <col className="w-40" />
            <col className="w-32" />
            <col className="w-36.5" />
            <col className="w-107.5" />
            <col className="w-94" />
            <col className="w-16" />
          </colgroup>
          <thead>
            <tr className="bg-(--gray-light) sticky top-0 z-15">
              {tableColumns.map((th) =>
                th.id === 'number' ? (
                  <th
                    key={th.id}
                    className="text-left text-[13px] text-(--gray) p-[8px_17px] text-nowrap"
                  >
                    {th.name}
                  </th>
                ) : th.id === 'delete' ? (
                  <th key={th.id}>{th.name}</th>
                ) : (
                  <th
                    key={th.id}
                    className="text-left text-[13px] text-(--gray) p-[8px_12px] text-nowrap"
                  >
                    {th.name}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rootStore.formattedMeters.map((meter, i) => {
              return (
                <tr
                  key={`${meter.id}${i}`}
                  className="border-b border-b-(--border) cursor-pointer hover:bg-(--gray-light-hover) h-13"
                >
                  <td className="text-center">{meter.index}</td>
                  <td className="px-3">{meter.meterType}</td>
                  <td className="px-3">{meter.installationDate}</td>
                  <td className="px-3">{meter.isAutomatic}</td>
                  <td className="px-3">{meter.initialValues}</td>
                  <td className="px-3">{meter.address}</td>
                  <td className="px-3">{meter.description}</td>
                  <td className="relative">
                    <Button
                      appearance="delete"
                      className="deleteButton absolute z-10 top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%]"
                      onClick={() => rootStore.deleteMeter(meter.id)}
                    >
                      <Icon id="cart" className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="sticky bottom-0 z-15">
            <tr>
              <td colSpan={8}>
                <Pagination className="bg-white flex justify-end items-center h-13 gap-2 px-1" />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
});
