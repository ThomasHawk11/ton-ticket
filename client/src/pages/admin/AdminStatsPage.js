import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { 
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import frLocale from 'date-fns/locale/fr';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import eventService from '../../services/eventService';
import ticketService from '../../services/ticketService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminStatsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: []
  });
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: []
  });
  const [topEvents, setTopEvents] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    averageTicketPrice: 0,
    conversionRate: 0
  });
  
  useEffect(() => {
    fetchStats();
  }, [timeRange, startDate, endDate]);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      let start = startDate;
      let end = endDate;
      
      if (timeRange === 'week') {
        start = new Date(new Date().setDate(new Date().getDate() - 7));
      } else if (timeRange === 'month') {
        start = new Date(new Date().setMonth(new Date().getMonth() - 1));
      } else if (timeRange === 'year') {
        start = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      }
      
      const salesLabels = generateDateLabels(start, end, timeRange);
      const salesValues = generateRandomData(salesLabels.length, 10, 100);
      const revenueValues = salesValues.map(value => value * (Math.random() * 20 + 10));
      
      setSalesData({
        labels: salesLabels,
        datasets: [
          {
            label: 'Billets vendus',
            data: salesValues,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            yAxisID: 'y'
          },
          {
            label: 'Revenus (€)',
            data: revenueValues,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            yAxisID: 'y1'
          }
        ]
      });
      
      const categories = ['Concert', 'Festival', 'Théâtre', 'Sport', 'Conférence', 'Exposition'];
      const categoryValues = generateRandomData(categories.length, 5, 30);
      
      setCategoryData({
        labels: categories,
        datasets: [
          {
            label: 'Événements par catégorie',
            data: categoryValues,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }
        ]
      });
      
      setTopEvents([
        { id: 1, title: 'Festival de Jazz', ticketsSold: 450, revenue: 22500, conversionRate: 85 },
        { id: 2, title: 'Concert Rock', ticketsSold: 380, revenue: 19000, conversionRate: 76 },
        { id: 3, title: 'Pièce de théâtre', ticketsSold: 320, revenue: 12800, conversionRate: 80 },
        { id: 4, title: 'Match de football', ticketsSold: 280, revenue: 8400, conversionRate: 70 },
        { id: 5, title: 'Exposition d\'art', ticketsSold: 210, revenue: 4200, conversionRate: 65 }
      ]);
      
      setSummaryStats({
        totalEvents: 48,
        totalTickets: 3250,
        totalRevenue: 162500,
        averageTicketPrice: 50,
        conversionRate: 75
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Erreur lors du chargement des statistiques');
      setLoading(false);
    }
  };
  
  const generateDateLabels = (start, end, range) => {
    const labels = [];
    const current = new Date(start);
    
    while (current <= end) {
      if (range === 'week' || range === 'custom' && end - start <= 7 * 24 * 60 * 60 * 1000) {
        labels.push(current.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        current.setDate(current.getDate() + 1);
      } else if (range === 'month' || range === 'custom' && end - start <= 31 * 24 * 60 * 60 * 1000) {
        labels.push(current.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        current.setDate(current.getDate() + 2); 
      } else if (range === 'year' || range === 'custom') {
        labels.push(current.toLocaleDateString('fr-FR', { month: 'short' }));
        current.setMonth(current.getMonth() + 1);
      }
    }
    
    return labels;
  };
  
  const generateRandomData = (length, min, max) => {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1) + min));
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    
    if (event.target.value === 'custom') {
      return;
    }
    
    let start = new Date();
    const end = new Date();
    
    if (event.target.value === 'week') {
      start = new Date(new Date().setDate(new Date().getDate() - 7));
    } else if (event.target.value === 'month') {
      start = new Date(new Date().setMonth(new Date().getMonth() - 1));
    } else if (event.target.value === 'year') {
      start = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    }
    
    setStartDate(start);
    setEndDate(end);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const salesChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Ventes et revenus',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Billets vendus'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Revenus (€)'
        }
      },
    },
  };
  
  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Événements par catégorie',
      },
    },
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Statistiques
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="time-range-label">Période</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range"
                value={timeRange}
                label="Période"
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="week">7 derniers jours</MenuItem>
                <MenuItem value="month">30 derniers jours</MenuItem>
                <MenuItem value="year">12 derniers mois</MenuItem>
                <MenuItem value="custom">Personnalisé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {timeRange === 'custom' && (
            <>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                  <DatePicker
                    label="Date de début"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    maxDate={endDate}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                  <DatePicker
                    label="Date de fin"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={startDate}
                    maxDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
            </>
          )}
          
          <Grid item xs={12} md={timeRange === 'custom' ? 2 : 8}>
            <Button
              variant="contained"
              startIcon={<DateRangeIcon />}
              onClick={fetchStats}
              fullWidth
            >
              Appliquer
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Événements
                  </Typography>
                  <Typography variant="h4">
                    {summaryStats.totalEvents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Billets vendus
                  </Typography>
                  <Typography variant="h4">
                    {summaryStats.totalTickets}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Revenus totaux
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(summaryStats.totalRevenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Prix moyen
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(summaryStats.averageTicketPrice)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Taux de conversion
                  </Typography>
                  <Typography variant="h4">
                    {summaryStats.conversionRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Évolution des ventes et revenus
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400 }}>
                  <Line options={salesChartOptions} data={salesData} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PieChartIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Répartition par catégorie
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400 }}>
                  <Pie options={categoryChartOptions} data={categoryData} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BarChartIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Top 5 des événements
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Événement</TableCell>
                        <TableCell align="right">Billets vendus</TableCell>
                        <TableCell align="right">Revenus</TableCell>
                        <TableCell align="right">Taux de conversion</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>{event.title}</TableCell>
                          <TableCell align="right">{event.ticketsSold}</TableCell>
                          <TableCell align="right">{formatCurrency(event.revenue)}</TableCell>
                          <TableCell align="right">{event.conversionRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdminStatsPage;
