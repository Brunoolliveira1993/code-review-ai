type TaskError = {
  error: string;
};

export type TaskResult<T> = T | TaskError;

export class PromisePool {
  async execute<T>(tasks: Array<() => Promise<T>>, limit = 3): Promise<TaskResult<T>[]> {
    const results: TaskResult<T>[] = [];
    const errors: Array<{ index: number; error: string }> = [];
    let index = 0;

    async function worker(): Promise<void> {
      while (index < tasks.length) {
        const currentIndex = index++;
        try {
          results[currentIndex] = await tasks[currentIndex]();
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          results[currentIndex] = { error: message };
          errors.push({ index: currentIndex, error: message });
        }
      }
    }

    const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
    await Promise.all(workers);

    if (errors.length > 0 && errors.length === tasks.length) {
      throw new Error(`Todas as ${tasks.length} análises falharam: ${errors[0].error}`);
    }

    return results;
  }
}
