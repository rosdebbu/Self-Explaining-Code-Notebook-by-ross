
import type { DataFrame } from './types';

export const INITIAL_CODE = "import numpy as np\ndf.groupby('Category')['Value'].agg(np.mean)";

export const SAMPLE_DATAFRAME: DataFrame = {
  columns: ["ID", "Category", "Value"],
  rows: [
    ["1", "A", "10"],
    ["2", "B", "20"],
    ["3", "A", "15"],
    ["4", "C", "30"],
    ["5", "B", "25"],
    ["6", "A", "12"],
  ],
};