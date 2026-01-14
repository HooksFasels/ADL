import express from 'express';
import {  } from '@/modules/auth/auth.routes';
import cors from 'cors';
import { env } from '@/config/env';
import "dotenv/config";
import {z} from "zod";
import { globalErrorHandler } from '@/middlewares/error.middleware';
import { ERRORCODES } from '@/modules/auth/auth.constants';



