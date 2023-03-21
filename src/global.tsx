const hostname: string = window.location.hostname;

let host: string = window.location.host
let port: string = '';
let secure: string = window.location.protocol.includes('https') ? 's' : ''
if (hostname.includes('localhost') || hostname.includes('192.168.')) {
  port = ':7000';
  host = hostname
}

export const API_URL: string = 'http'+secure+'://' + host + port + '/api';
export const API_WSURL: string = 'ws'+secure+'://'+ host + port + '/api';
export const SITE_NAME: string = 'PESATU';
export const UserCountResult: number = 10;
export const MessageLimit: number = 40;
