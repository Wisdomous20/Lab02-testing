import request from "supertest";
import app from "../src/index";
import { pool } from "../src/index";


describe("pogs", () => {
  describe("GET /pogs", () => {
    it("should return a list of pogs if they exist", async () => {
      let db = await pool.connect();
      await db.query(`INSERT INTO Pogs (pogs_name, ticker_symbol, price, color) VALUES
      ('Pogs 1', 'POG1', 10, 'Red'),
      ('Pogs 2', 'POG2', 15, 'Blue')`);

      const response = await request(app).get("/pogs");
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expect.any(Array));

      await db.query(`truncate table pogs`);
      db.release();
    });
  });

  describe("GET /pogs/:id", () => {
    it("should return the pog with the specified id if it exists", async () => {
      let db = await pool.connect();
      const result = await db.query(`INSERT INTO Pogs (pogs_name, ticker_symbol, price, color) VALUES
      ('Pogs 1', 'POG1', 10, 'Red'),
      ('Pogs 2', 'POG2', 15, 'Blue') RETURNING *`);

      const response = await request(app).get("/pogs/" + result.rows[0].pogs_id);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expect.any(Object));

      await db.query(`truncate table pogs`);
      db.release();
    });
  });

  describe("GET /pogs/:id", () => {
    it("should return 404 if the pog with the specified id does not exist", async () => {
      const response = await request(app).get("/pogs/999");
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe("pogs not found");
    });
  });

  describe("POST /pogs", () => {
    it("should create a new pog", async () => {
      const newPog = {
        pogs_name: "New Pog",
        ticker_symbol: "NP",
        price: 10,
        color: "red",
      };
      const response = await request(app).post("/pogs").send(newPog);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it("should return 422 if required fields are missing", async () => {
      const incompletePog = {
        ticker_symbol: "NP",
        price: 10,
        color: "red",
      };
      const response = await request(app).post("/pogs").send(incompletePog);
      expect(response.status).toBe(422);
    });
  });

  describe('PUT /pogs/:id', () => {
    it('should update a pog successfully', async () => {
      const db = await pool.connect();
      const oldPog = await db.query('INSERT INTO pogs (pogs_name, ticker_symbol, price, color) VALUES ($1, $2, $3, $4) RETURNING *', ['old pog', 'NP', 10, 'blue']);
      const newPog = {
        pogs_name: 'New Pog Name',
        ticker_symbol: 'NP',
        price: 10,
        color: 'blue'
      };

      console.log(oldPog.rows[0].pogs_id)
  
      const response = await request(app)
        .put('/pogs/' + oldPog.rows[0].pogs_id) // Assuming the ID of the pog to update is 1
        .send(newPog);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expect.any(Array));
    });
  
    it('should return 422 if required fields are missing', async () => {
      const response = await request(app)
        .put('/pogs/213') // Assuming the ID of the pog to update is 1
        .send({});
  
      expect(response.statusCode).toBe(422);
      expect(response.body).toEqual(expect.any(Object));
    });
  
    it('should return 404 if pog with given ID is not found', async () => {
      const response = await request(app)
        .put('/pogs/9999') // Assuming the ID 9999 does not exist
        .send({
          pogs_name: 'New Pog Name',
          ticker_symbol: 'NP',
          price: 10,
          color: 'blue'
        });
  
      expect(response.status).toBe(404);
      expect(response.text).toBe('pogs not found');
    });
  });

  describe("PUT /pogs/:id", () => {
    it("should return 422 if required fields are missing", async () => {
      const incompletePog = {
        ticker_symbol: "UP",
        price: 15,
        color: "blue",
      };
      const response = await request(app).put("/pogs/999").send(incompletePog);
      expect(response.status).toBe(422);
    });
  });

  describe("DELETE /pogs/:id", () => {
    it("should delete an existing pog", async () => {
      let db = await pool.connect();
      const result = await db.query(`INSERT INTO Pogs (pogs_name, ticker_symbol, price, color) VALUES
      ('Pogs 1', 'POG1', 10, 'Red'),
      ('Pogs 2', 'POG2', 15, 'Blue') RETURNING *`);

      const response = await request(app).delete("/pogs/" + result.rows[0].pogs_id);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expect.any(Array));

      await db.query(`truncate table pogs`);
      db.release();
    });
  });

  describe("DELETE /pogs/:id", () => {
    it("should return 404 if the pog does not exist", async () => {
      const response = await request(app).delete("/pogs/999");
      expect(response.status).toBe(404);
    });
  });
});

