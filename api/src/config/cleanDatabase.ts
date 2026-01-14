
class CleanDatabase {
    constructor() {
        this.cleanDatabase()
    }
    async cleanDatabase() {
        try {
        //    await Load.deleteMany({}) // delete all loads
          
        } catch (error) {
            console.warn("Error cleaning database", error)
        }
    }
}

export default CleanDatabase
