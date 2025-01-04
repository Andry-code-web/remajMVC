const EnVivo = require("../models/en_vivo.model");
const fs = require("fs").promises;
const path = require("path");

exports.getAdminDashboard = async (req, res) => {
    try {
        const remates = await EnVivo.getAll();
        const rematesActivos = remates.filter(r => r.estado === 'activo').length;
        const montoTotal = remates.reduce((sum, r) => sum + parseFloat(r.precios || 0), 0);

        res.render('admin/admin', {
            remates,
            totalRemates: remates.length,
            rematesActivos,
            montoTotal: montoTotal.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        });
    } catch (error) {
        console.error('Error en getAdminDashboard:', error);
        res.render('error', { message: 'Error al cargar el dashboard' });
    }
};

exports.createRemate = async (req, res) => {
    try {
        const nuevoRemate = await EnVivo.create(req.body);
        res.status(201).json(nuevoRemate);
    } catch (error) {
        console.error('Error al crear remate:', error);
        res.status(500).json({ error: 'Error al crear el remate' });
    }
};

exports.updateRemate = async (req, res) => {
    try {
        const remateId = req.params.id;
        const remateActualizado = await EnVivo.update(remateId, req.body);
        res.json(remateActualizado);
    } catch (error) {
        console.error('Error al actualizar remate:', error);
        res.status(500).json({ error: 'Error al actualizar el remate' });
    }
};

exports.getRemateById = async (req, res) => {
    try {
        const remateId = req.params.id;
        const remate = await EnVivo.getById(remateId);
        if (!remate) {
            return res.status(404).json({ error: 'Remate no encontrado' });
        }
        res.json(remate);
    } catch (error) {
        console.error('Error al obtener remate:', error);
        res.status(500).json({ error: 'Error al obtener el remate' });
    }
};