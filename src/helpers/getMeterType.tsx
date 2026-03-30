import { Icon } from '../components/ui/Icon/Icon';

export const getMeterType = (type: string) => {
  if (type === 'ColdWaterAreaMeter') {
    return (
      <div className="flex gap-2">
        <Icon id="HWAM" className="w-4 h-4" />
        <span className="uppercase">гвс</span>
      </div>
    );
  } else if (type === 'HotWaterAreaMeter') {
    return (
      <div className="flex gap-2 ">
        <Icon id="CWAM" className="w-4 h-4" />
        <span className="uppercase">хвс</span>
      </div>
    );
  } else {
    return <></>;
  }
};
