exports.getAllterminoscondiciones = (req, res) => {
    try {
        const terminoscondiciones = [
            { id: 1, texto: 'Términos y condiciones ejemplo 1' },
            { id: 2, texto: 'Términos y condiciones ejemplo 2' }
        ];

        res.render('terminos_condiciones/terminos_condiciones', { terminoscondiciones });
    } catch (error) {
        console.error('Error al cargar términos y condiciones:', error);
        res.status(500).send('Error al cargar términos y condiciones');
    }
};


exports.getAllpoliticasprivacidad = (req, res) => {
    try {
        const politicasprivacidad = [
            { id: 1, texto: 'Política de privacidad ejemplo 1' },
            { id: 2, texto: 'Política de privacidad ejemplo 2' }
        ];

        res.render('terminos_condiciones/politicas_privacidad', { politicasprivacidad });
    } catch (error) {
        console.error('Error al cargar políticas de privacidad:', error);
        res.status(500).send('Error al cargar políticas de privacidad');
    }
};
