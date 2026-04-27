class PromisePool {

    async execute(tasks, limit = 3) {
        const results = [];
        const errors = [];
        let index = 0;

        async function worker() {
        while (index < tasks.length) {
            const currentIndex = index++;
            try {
            results[currentIndex] = await tasks[currentIndex]();
            } catch (err) {
            results[currentIndex] = { error: err.message };
            errors.push({ index: currentIndex, error: err.message });
            }
        }
        }

        const workers = Array.from({ length: limit }, () => worker());

        await Promise.all(workers);

        // Se houver erros críticos, lançar para que sejam tratados
        if (errors.length > 0 && errors.length === tasks.length) {
            throw new Error(`Todas as ${tasks.length} análises falharam: ${errors[0].error}`);
        }

        return results;
    }
}

module.exports = PromisePool;