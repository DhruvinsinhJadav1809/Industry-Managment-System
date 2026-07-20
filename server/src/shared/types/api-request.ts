import { Request } from "express";

export type ApiRequest<TParams = {}, TBody = {}, TQuery = {}> = Request<
  TParams,
  {},
  TBody,
  TQuery
>;
