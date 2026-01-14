// create pagination to use in aggreagate and finds
const pagination = (
    page: number | string,
    limit: number | string) => {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    return [
        { $skip: skip, },
        { $limit: limitNumber, }
    ]
}
export default pagination;
