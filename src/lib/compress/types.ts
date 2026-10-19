export type ProfileId = "recommended" | "strong" | "maximum";

export type CompressMethod = "structure" | "raster" | "original";

export type TargetStatus = "none" | "met" | "unmet";

export type ResultStats = {
  inputBytes: number;
  outputBytes: number;
  pages: number;
  profile: ProfileId;
  method: CompressMethod;
  textPreserved: boolean;
  targetBytes: number | null;
  targetStatus: TargetStatus;
  attemptBytes: number[];
  grayscale: boolean;
};

export type ProgressMsg = {
  type: "progress";
  fraction: number;
  label: string;
};

export type WorkerResult = {
  type: "result";
  buffer: ArrayBuffer;
  thumb: ArrayBuffer | null;
  stats: ResultStats;
};

export type WorkerError = {
  type: "error";
  code: string;
  detail?: string;
};

export type WorkerOut = ProgressMsg | WorkerResult | WorkerError;

export type CompressPayload = {
  type: "compress";
  buffer: ArrayBuffer;
  profile: ProfileId;
  targetBytes: number | null;
  grayscale: boolean;
  removeMetadata: boolean;
  deadline: number;
  pdfWorkerUrl: string;
};

export type HistoryEntry = {
  id: string;
  at: number;
  name: string;
  inputBytes: number;
  outputBytes: number;
  profile: ProfileId;
  pages: number;
  method: CompressMethod;
};

export type Tone = "reduced" | "minimal" | "optimal" | "grew";
