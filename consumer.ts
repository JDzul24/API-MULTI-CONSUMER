import amqp from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getEvent() {
    const url = "amqp://carlos:12345@34.229.31.98";
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();

    const exchange = 'event';

    await channel.assertExchange(exchange, 'direct', { durable: true });

    const queueName = 'Event-Driven';
    const queue = await channel.assertQueue(queueName, { exclusive: false });
    await channel.bindQueue(queue.queue, exchange, '12345');

    console.log('Listening events of RabbitMQ');

    channel.consume(queue.queue, async (mensaje) => {
        console.log(mensaje);

        if (mensaje !== null) {
            const contenido = mensaje.content.toString();
            console.log(`Contenido recibido: ${contenido}`);
            const objeto = JSON.parse(contenido);
            const id = JSON.parse(mensaje.content.toString());
            const idMmalon = parseInt(id)
            console.log(`Message received: ${id}`);
            try {
                const response = await axios.post('https://api-multi-secundaria.onrender.com/registrations', { id_venta: id });
                console.log(response);
                
            } catch (error) {
                console.log(error);
            }
        }
    }, { noAck: true });

}
getEvent().then((res) => console.log(res)
).catch(console.error);