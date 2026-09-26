import { chapters } from "@/lib/gateData";

export function buildDefaultProgressState() {
  return Object.fromEntries(
    chapters.map((chapter) => [
      chapter.id,
      {
        status: "not_started",
        pyqDone: false,
      },
    ]),
  );
}
