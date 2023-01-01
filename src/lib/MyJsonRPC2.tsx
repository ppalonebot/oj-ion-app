const uuid_1 = require("uuid");

interface jsonrpc2 {
  jsonrpc: string;
  method: string;
  params: unknown;
  id: string;
}

export class JsonRPC2 implements jsonrpc2{
  jsonrpc: string = "2.0";
  method: string;
  params: unknown;
  id: string = uuid_1.v4();

  constructor (method : string, params : unknown){
    this.method = method;
    this.params = params;
  }
}

export interface JsonRPCresult {
  jsonrpc: string;
  result?: unknown;
  error?: unknown;
  id: string;
}