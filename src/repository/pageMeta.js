class PageMeta {

    constructor(pageSize, pageNumber, totalItems) {
        totalItems = Math.max(0, totalItems);
        pageSize = Math.max(1, pageSize);
        const lastPageNumber = totalItems == 0 ? 0 : Math.floor((totalItems - 1) / pageSize);
        pageNumber = Math.min(Math.max(0, pageNumber), lastPageNumber);
        const totalPages = totalItems == 0 ? 0 : Math.floor(totalItems / pageSize) + 1;

        this.totalItems = totalItems;
        this.pageSize = pageSize;
        this.lastPageNumber = lastPageNumber;
        this.pageNumber = pageNumber;
        this.totalPages = totalPages;
    }

    offset() {
        return this.pageNumber * this.pageSize;
    }
};

export default PageMeta;