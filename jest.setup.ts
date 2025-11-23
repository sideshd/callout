import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextEncoder, TextDecoder })

// Polyfill Web APIs
import { Request, Response, Headers } from 'cross-fetch'
Object.assign(global, { Request, Response, Headers })

// Polyfill TransformStream
const { TransformStream } = require('stream/web')
Object.assign(global, { TransformStream })
