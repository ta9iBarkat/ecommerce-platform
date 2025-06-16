
class ApiFeatures {
    constructor(query, queryString) {
      this.query = query; // Mongoose query (e.g., Product.find())
      this.queryString = queryString; // The query string from the URL (req.query)
    }
  
    search() {
      const keyword = this.queryString.search
        ? {
            // Search in both name and description
            $or: [
              { name: { $regex: this.queryString.search, $options: 'i' } }, // 'i' for case-insensitive
              { description: { $regex: this.queryString.search, $options: 'i' } },
            ],
          }
        : {};
  
      this.query = this.query.find({ ...keyword });
      return this; // Return the instance to allow chaining
    }
  
    filter() {
      // 1. Create a shallow copy of the query string
      const queryCopy = { ...this.queryString };
  
      // 2. Define fields to be removed from the filter
      const removeFields = ['search', 'page', 'limit'];
      removeFields.forEach((key) => delete queryCopy[key]);
  
      // 3. Advanced Filtering for price (gte, lte, etc.)
      // We need to add a '$' before gte, lte, etc. to make it a MongoDB operator
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
      
      // The query string is now a valid MongoDB query object
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }
  
    paginate() {
      const currentPage = Number(this.queryString.page) || 1;
      const limit = Number(this.queryString.limit) || 10; // Default to 10 results per page
      const skip = (currentPage - 1) * limit;
  
      this.query = this.query.limit(limit).skip(skip);
      return this;
    }
  }
  
  export default ApiFeatures;