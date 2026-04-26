class PromisePool {

    async execute(tasks, limit = 3) {
        const results = [];
        let index = 0;

        async function worker() {
        while (index < tasks.length) {
            const currentIndex = index++;
            try {
            results[currentIndex] = await tasks[currentIndex]();
            } catch (err) {
            results[currentIndex] = { error: err.message };
            }
        }
        }

        const workers = Array.from({ length: limit }, () => worker());

        await Promise.all(workers);

        return results;
    }
}

module.exports = PromisePool;