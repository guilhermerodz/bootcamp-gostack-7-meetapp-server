export default {
  helpers: {
    biggerThan(e1, e2, options) {
      if (e1 > e2) return options.fn(this);
      return options.inverse(this);
    }
  }
};
