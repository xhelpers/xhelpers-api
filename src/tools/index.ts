import * as Joi from "joi";
import * as Boom from "@hapi/boom";
import * as jwt from "jsonwebtoken";
import axios, { AxiosStatic } from "axios";
import * as uuid from "uuid";
import * as amqplib from "amqplib";
import * as moment from "moment-timezone";

const dotenv = require("dotenv");

export { Boom, Joi, jwt, dotenv, axios, AxiosStatic, uuid, amqplib, moment };
