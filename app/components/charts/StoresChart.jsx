import { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line,
    PieChart, Pie, Cell,
    ResponsiveContainer,
} from 'recharts';
import { statsService } from '../../services/stats';
import Loading from '../ui/Loading';
import Avatar from '../ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

export default function StoresChart() {
    const [storeCreations, setStoreCreations] = useState([]);
    const [storeSectors, setStoreSectors] = useState([]);
    const [topStores, setTopStores] = useState([]);
    const [storeMetric, setStoreMetric] = useState('followers');
    const [range, setRange] = useState('daily') // 'daily' | 'weekly' | 'monthly'

    const [loading, setLoading] = useState(false);
    const limit = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');

                const [
                    storeCreationsRes,
                    storeSectorsRes,
                    topStoresRes
                ] = await Promise.all([
                    statsService.getStoresCountByPeriod(token, range),
                    statsService.getStoresBySector(token),
                    statsService.getStoresTop(token, storeMetric, limit)
                ]);

                setStoreCreations(storeCreationsRes.data);
                setStoreSectors(storeSectorsRes.data);
                setTopStores(topStoresRes.data);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storeMetric, range]);

    if (loading) return <Loading />

    return (
        <div className='stores-charts'>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Boutiques créées
                    </CardTitle>
                    <select value={range} onChange={e => setRange(e.target.value)}>
                        <option value="daily">Jour</option>
                        <option value="weekly">Semaine</option>
                        <option value="monthly">Mois</option>
                    </select>
                </CardHeader>
                <CardContent>
                    <section style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={storeCreations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </section>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Répartition par secteur d’activité
                    </CardTitle>
                    <select value={range} onChange={e => setRange(e.target.value)}>
                        <option value="daily">Jour</option>
                        <option value="weekly">Semaine</option>
                        <option value="monthly">Mois</option>
                    </select>
                </CardHeader>
                <CardContent>
                    <section style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={storeSectors} dataKey="count" nameKey="sector" cx="50%" cy="50%" outerRadius={100} label>
                                    {storeSectors.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </section>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Top Boutiques
                    </CardTitle>
                    <select value={storeMetric} onChange={e => setStoreMetric(e.target.value)}>
                        <option value="followers">abonnés</option>
                        <option value="likes">likes</option>
                    </select>
                </CardHeader>
                <CardContent>
                    <section className="list-table-container">
                        <table  className="list-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Abonnés</th>
                                    <th>Likes</th>
                                    <th>Catégorie</th>
                                    <th>Créée le</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topStores.map(store => (
                                    <tr key={store.id}>
                                        <td className='stores-name'>
                                            <Avatar size='sm' src={store.avatar} />
                                            {store.name}
                                        </td>
                                        <td>{store._count?.followers ?? 0}</td>
                                        <td>{store._count?.likes ?? 0}</td>
                                        <td>{store.category}</td>
                                        <td>{new Date(store.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
};
