import { formatNumber } from "@/utils/helpers";
import { Star } from "@/utils/icons";

export interface RatingProps {
  rate: number;
  count?: number;
}

const Rating: React.FC<RatingProps> = ({ rate = 0, count = 0 }) => {
  const safeRate = Number.isFinite(rate) ? rate : 0;
  const safeCount = Number.isFinite(count) ? count : 0;

  return (
    <div className="flex items-center gap-1 font-semibold text-warning-500">
      <Star />
      <p>
        {safeRate.toFixed(1)} {safeCount > 0 && `(${formatNumber(safeCount)})`}
      </p>
    </div>
  );
};

export default Rating;
