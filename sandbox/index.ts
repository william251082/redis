import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
    await client.hSet('car#1', {
        color: 'red',
        year: 1950
    })
    await client.hSet('car#2', {
        color: 'red',
        year: 1950
    })
    await client.hSet('car#3', {
        color: 'red',
        year: 1950
    })
    const commands = [1,2,3].map((id) => {
        return client.hGetAll(`car#${id}`)
    })
    const results = await Promise.all(commands)
    // const car = await client.hGetAll('car')
    // if (Object.keys(car).length === 0) {
    //     console.log('Car not found, respond 404')
    // }
    // console.log(car)
}
run();
