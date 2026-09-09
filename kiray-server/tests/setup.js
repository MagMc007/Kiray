import express from "express";

// Polyfill express.request.query setter for Express 5 compatibility with express-mongo-sanitize
const queryDescriptor = Object.getOwnPropertyDescriptor(express.request, "query");
if (queryDescriptor && !queryDescriptor.set) {
  Object.defineProperty(express.request, "query", {
    configurable: true,
    enumerable: true,
    get: queryDescriptor.get,
    set(val) {
      this._query = val;
    },
  });
}
