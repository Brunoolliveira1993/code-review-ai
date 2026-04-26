class DiffChunker {

    chunkByFile(changes) {
        return changes.map(change => [change]);
    }

}

module.exports = DiffChunker;