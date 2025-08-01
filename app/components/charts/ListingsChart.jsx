import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line,
    PieChart, Pie, Cell,
    ResponsiveContainer,
} from 'recharts';
import { formattedDate } from '../../utils';
import { useEffect, useState } from 'react';
import { statsService } from '../../services/stats';
import Loading from '../ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#8b5cf6', '#ec4899'];

export default function ListingsChart() {
    const [periodStats, setPeriodStats] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [topListings, setTopListings] = useState([]);
    const [metric, setMetric] = useState('views'); // 'views' | 'likes'
    const [range, setRange] = useState('daily') // 'daily' | 'weekly' | 'monthly'

    const [loading, setLoading] = useState(false);
    const limit = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');

                const [
                    listingsRange,
                    listingsByCat,
                    topListingsRes,
                ] = await Promise.all([
                    statsService.getListingCountByPeriod(token, range),
                    statsService.getListingByCategory(token),
                    statsService.getTopListings(token, metric, limit),
                ]);

                setPeriodStats(listingsRange.data);
                setCategoryStats(listingsByCat.data);
                setTopListings(topListingsRes.data);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [metric, range]);



    if (loading) return <Loading />

    return (
        <div className='listings-charts'>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Créations quotidiennes
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
                            <LineChart data={periodStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </section>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Annonces par catégorie
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <section style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryStats}
                                    dataKey="count"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, value }) => `${name} (${value})`}
                                    isAnimationActive={false}
                                >
                                    {categoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value} annonces`, 'Catégorie']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </section>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Top 10 Annonces
                    </CardTitle>
                    <select value={metric} onChange={e => setMetric(e.target.value)}>
                        <option value="views">vues</option>
                        <option value="likes">likes</option>
                        <option value="clicks">clicks</option>
                    </select>
                </CardHeader>
                <CardContent>
                    <section style={{ width: '100%', height: 350 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left' }}>Titre</th>
                                    <th>Vues</th>
                                    <th>Likes</th>
                                    <th>Clicks</th>
                                    <th>Catégorie</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topListings.map(listing => (
                                    <tr key={listing.id}>
                                        <td>{listing.details?.title}</td>
                                        <td style={{ fontWeight: metric === 'views' ? 'bold' : 'normal' }}>
                                            {listing._count?.views || 0}
                                        </td>
                                        <td style={{ fontWeight: metric === 'likes' ? 'bold' : 'normal' }}>
                                            {listing._count?.likes || 0}
                                        </td>
                                        <td style={{ fontWeight: metric === 'clicks' ? 'bold' : 'normal' }}>
                                            {listing._count?.clicks || 0}
                                        </td>
                                        <td>{listing.category}</td>
                                        <td>{formattedDate(listing.createdAt)}</td>
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
