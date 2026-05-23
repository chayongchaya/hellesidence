import { Router } from 'express';
import * as c from '../controllers/maintenance.controller.js';
const r = Router();
r.get('/', c.list);
r.post('/', c.create);
r.get('/:id', c.getOne);
r.put('/:id', c.update);
r.delete('/:id', c.remove);
export default r;
