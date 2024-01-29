const express = require("express");
const fs = require("fs");
const path = require('path');
const {Client} = require('pg');
const formidable = require('formidable');
const PORT= 1309;

var client= new Client({database:"proiect_pibd",
        user:"andreic",
        password:"1234",
        host:"localhost",
        port:5432});
client.connect();

app= express();
app.set("view engine","ejs");
app.use("/resources", express.static(__dirname+"/resources"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.get(["/"], function(req, res){
    res.render("pages/home", { pageTitle: 'Welcome to Goodman &CO'});
});

app.get(["/view"], function(req, res){
    
    res.render("pages/view", { pageTitle: 'Select a Table'});
        
});

app.get(["/add"], function(req, res){
    
    res.render("pages/add", { pageTitle: 'Welcome to My Homepage', message: 'Hello, world!' });
        
});

app.get(["/view/avocati"], function(req, res){
    client.query(
        `SELECT * FROM avocat ORDER BY id_avocat`, function(queryErr, queryRes){
            if(queryErr){
                res.render("pages/eroare", {eroare:String(queryErr)});
            }else{
                //console.log(queryRes.rows);
                res.render("pages/avocati", {pageTitle: 'Avocati', entries: queryRes.rows, nr_rez:queryRes.rowCount});
            }
        });
});

app.get("/view/contracte", function (req, res) {
    client.query(
        `SELECT 
            c.id_contract, c.id_avocat_ctr, a.nume AS nume_avocat, a.prenume AS prenume_avocat,
            c.id_client_ctr, cl.nume AS nume_client, cl.prenume AS prenume_client,
            c.valoare, c.data_start, c.data_sfarsit, c.judecatorie
         FROM contract c
         JOIN avocat a ON c.id_avocat_ctr = a.id_avocat
         JOIN client cl ON c.id_client_ctr = cl.id_client
         ORDER BY c.id_contract`,
        function (queryErr, queryRes) {
            if (queryErr) {
                res.render("pages/eroare", { eroare: String(queryErr) });
            } else {
                res.render("pages/contracte", {
                    pageTitle: 'Contracte',
                    entries: queryRes.rows,
                    nr_rez: queryRes.rowCount
                });
            }
        }
    );
});

app.get(["/view/clienti"], function(req, res){
    client.query(
        `SELECT * FROM client ORDER BY id_client`, function(queryErr, queryRes){
            if(queryErr){
                res.render("pages/eroare", {eroare:String(queryErr)});
            }else{
                //console.log(queryRes.rows);
                res.render("pages/clienti", {pageTitle: 'Clienti', entries: queryRes.rows, nr_rez:queryRes.rowCount});
            }
        });
});

app.get('/add/avocat', (req, res) => {
    res.render('pages/add_avocat', {pageTitle: 'Add a New Entry'});
});

app.post('/create/avocat', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Eroare');
            return;
        }

        const {
            nume,
            prenume,
            email,
            cnp,
            telefon,
            specializare,
            speta
        } = fields;

        const query = `
            INSERT INTO avocat (nume, prenume, email, cnp, telefon, specializare, speta)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        const values = [nume, prenume, email, cnp, telefon, specializare, speta];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
        });


        try {
            await client.query(query, values);
            res.redirect('/view/avocati'); 
        } catch (error) {
            //console.error(error);
            res.render("pages/eroare", {eroare:String(error.detail)});
        }
    });
});

app.get('/add/client', (req, res) => {
    res.render('pages/add_client', {pageTitle: 'Add a New Entry'});
});

app.post('/create/client', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Eroare');
            return;
        }

        const {
            nume,
            prenume,
            email,
            cnp,
            telefon,
            adresa
        } = fields;

        const query = `
            INSERT INTO client (nume, prenume, email, cnp, telefon, adresa)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const values = [nume, prenume, email, cnp, telefon, adresa];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
        });


        try {
            await client.query(query, values);
            res.redirect('/view/clienti'); 
        } catch (error) {
            //console.error(error);
            res.render("pages/eroare", {eroare:String(error.detail)});
        }
    });
});

app.get('/add/contract', async (req, res) => {
    try {
        const avocatList = await client.query('SELECT id_avocat, nume, prenume FROM avocat');
        const clientList = await client.query('SELECT id_client, nume, prenume FROM client');

        if (avocatList.rows.length === 0 || clientList.rows.length === 0) {
            res.render('pages/eroare', {
                eroare: 'There must be at least one "client" and one "avocat" to create a contract.'
            });
        } else {
            res.render('pages/add_contract', {
                pageTitle: 'Add a New Entry',
                avocatList: avocatList.rows,
                clientList: clientList.rows
            });
        }
    } catch (error) {
        res.render("pages/eroare", { eroare: String(error) });
    }
});

app.post('/create/contract', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }

        const {
            id_avocat_ctr,
            id_client_ctr,
            valoare,
            data_start,
            data_sfarsit,
            judecatorie
        } = fields;

        const query = `
            INSERT INTO contract (id_avocat_ctr, id_client_ctr, valoare, data_start, data_sfarsit, judecatorie)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        values = [id_avocat_ctr, id_client_ctr, valoare, data_start, data_sfarsit, judecatorie];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
            if(index == 4 && element_clean == ''){
                values[index] = null;
            }
        });


        try {
            await client.query(query, values);
            res.redirect('/view/contracte'); 
        } catch (error) {
            console.error(error);
            //res.status(500).send('Eroare.');
            res.render("pages/eroare", {eroare:String(error)});
        }
    });
});


app.get('/edit/avocat/:id', function(req, res){
    const avocatId = req.params.id;
    client.query(
        `SELECT * FROM avocat where id_avocat = $1`, [avocatId], function(queryErr, queryRes){
            if(queryErr){
                res.render("pages/eroare", {eroare:String(queryErr)});
            }else{
                //console.log(queryRes.rows);
                if(queryRes.rowCount<=0){
                    res.render("pages/eroare", {eroare:String("Nu exista.")});
                }
                res.render('pages/edit_avocat', {pageTitle: 'Modify this Entry', result: queryRes.rows[0]});
            }
        });
});

app.post('/edit/avocat/action/:id', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Eroare');
            return;
        }

        const {
            nume,
            prenume,
            email,
            cnp,
            telefon,
            specializare,
            speta
        } = fields;

        const query = `
        UPDATE avocat
        SET nume = $1,
            prenume = $2,
            email = $3,
            cnp = $4,
            telefon = $5,
            specializare = $6,
            speta = $7
        WHERE id_avocat = $8;
        `;

        const values = [nume, prenume, email, cnp, telefon, specializare, speta];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
        });

        values.push(req.params.id);

        try {
            await client.query(query, values);
            res.redirect('/view/avocati'); 
        } catch (error) {
            //console.error(error);
            res.render("pages/eroare", {eroare:String(error.detail)});
        }
    });
});

app.get('/edit/client/:id', function(req, res){
    const clientId = req.params.id;
    client.query(
        `SELECT * FROM client where id_client = $1`, [clientId], function(queryErr, queryRes){
            if(queryErr){
                res.render("pages/eroare", {eroare:String(queryErr)});
            }else{
                //console.log(queryRes.rows);
                if(queryRes.rowCount<=0){
                    res.render("pages/eroare", {eroare:String("Nu exista.")});
                }
                res.render('pages/edit_client', {pageTitle: 'Modify this Entry', result: queryRes.rows[0]});
            }
        });
});

app.post('/edit/client/action/:id', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }

        const {
            nume,
            prenume,
            email,
            cnp,
            telefon,
            adresa
        } = fields;

        const query = `
        UPDATE client
        SET nume = $1,
            prenume = $2,
            email = $3,
            cnp = $4,
            telefon = $5,
            adresa = $6
        WHERE id_client = $7;
        `;

        const values = [nume, prenume, email, cnp, telefon, adresa];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
        });

        values.push(req.params.id);

        try {
            await client.query(query, values);
            res.redirect('/view/clienti'); 
        } catch (error) {
            console.error(error);
            res.render("pages/eroare", {eroare:String(error.detail)});
        }
    });
});

app.get('/edit/contract/:id', async (req, res) => {
    const contractId = req.params.id;
    try {
        const avocatList = await client.query('SELECT id_avocat, nume, prenume FROM avocat');
        const clientList = await client.query('SELECT id_client, nume, prenume FROM client');
        const contractResult = await client.query('SELECT * FROM contract WHERE id_contract = $1', [contractId]);

        if (contractResult.rowCount <= 0) {
            res.render("pages/eroare", { eroare: "Nu exista." });
        }

        res.render('pages/edit_contract', {
            pageTitle: 'Modify this Entry',
            avocatList: avocatList.rows,
            clientList: clientList.rows,
            result: contractResult.rows[0]
        });
    } catch (error) {
        res.render("pages/eroare", { eroare: String(error) });
    }
});

app.post('/edit/contract/action/:id', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Eroare');
            return;
        }

        const {
            id_avocat_ctr,
            id_client_ctr,
            valoare,
            data_start,
            data_sfarsit,
            judecatorie
        } = fields;

        const query = `
        UPDATE contract
        SET id_avocat_ctr = $1,
            id_client_ctr = $2,
            valoare = $3,
            data_start = $4,
            data_sfarsit = $5,
            judecatorie = $6
        WHERE id_contract = $7;
        `;

        const values = [id_avocat_ctr, id_client_ctr, valoare, data_start, data_sfarsit, judecatorie];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
            if(index == 4 && element_clean == ''){
                values[index] = null;
            }
        });

        values.push(req.params.id);

        try {
            await client.query(query, values);
            res.redirect('/view/contracte'); 
        } catch (error) {
            //console.error(error);
            res.render("pages/eroare", {eroare:String(error)});
        }
    });
});

app.post("/delete/avocat/:id", function(req, res){
    const avocatId = req.params.id;
    console.log('Deleting avocat with id:', avocatId);
    client.query('DELETE FROM avocat WHERE id_avocat = $1', [avocatId], function(err, rez){
        if(err){
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }
        console.log('Delete successful');
        res.redirect("/view/avocati");
    });
});


app.post("/delete/client/:id", function(req, res){
    const clientId = req.params.id;
    client.query('DELETE FROM client WHERE id_client = $1', [clientId], function(err, rez){
        if(err){
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }
        console.log('Delete successful');
        res.redirect("/view/clienti");
    });
});


app.post("/delete/contract/:id", function(req, res){
    const contractId = req.params.id;
    client.query('DELETE FROM contract WHERE id_contract = $1', [contractId], function(err, rez){
        if(err){
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }
        console.log('Delete successful');
        res.redirect("/view/contracte");
    });
});


app.listen(PORT, ()=>{
    console.log(`Serverul a pornit, port: ${PORT}`);
});