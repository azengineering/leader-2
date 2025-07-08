
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, MessageSquare, Calendar as CalendarIcon, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { getUserCount } from "@/data/users";
import { getLeaderCount, getRatingCount } from "@/data/leaders";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from "react-day-picker";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { indianStates } from '@/data/locations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Stats {
    userCount: number;
    leaderCount: number;
    ratingCount: number;
}

export default function AdminDashboard() {
  const [totalStats, setTotalStats] = useState<Stats | null>(null);
  const [filteredStats, setFilteredStats] = useState<Stats | null>(null);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [selectedState, setSelectedState] = useState<string>('all-states');
  const [constituency, setConstituency] = useState<string>('');
  const [isTotalLoading, setIsTotalLoading] = useState(true);
  const [isFilteredLoading, setIsFilteredLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch total stats on initial load
  useEffect(() => {
    const fetchTotalStats = async () => {
      try {
        setIsTotalLoading(true);
        setError(null);

        console.log('Fetching total statistics...');
        
        const [userCount, leaderCount, ratingCount] = await Promise.all([
          getUserCount().catch(err => {
            console.error('Error fetching user count:', err);
            return 0;
          }),
          getLeaderCount().catch(err => {
            console.error('Error fetching leader count:', err);
            return 0;
          }),
          getRatingCount().catch(err => {
            console.error('Error fetching rating count:', err);
            return 0;
          }),
        ]);

        console.log('Stats fetched:', { userCount, leaderCount, ratingCount });

        // Validate the data
        if (typeof userCount !== 'number' || typeof leaderCount !== 'number' || typeof ratingCount !== 'number') {
          throw new Error('Invalid data format received from server');
        }

        setTotalStats({ 
          userCount: userCount || 0, 
          leaderCount: leaderCount || 0, 
          ratingCount: ratingCount || 0 
        });
        
      } catch (error) {
        console.error('Dashboard stats error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard statistics';
        setError(errorMessage);
        
        toast({ 
          variant: 'destructive', 
          title: 'Error loading statistics',
          description: 'Please check the console for details and try refreshing the page'
        });
        
        // Set fallback stats to prevent UI issues
        setTotalStats({ userCount: 0, leaderCount: 0, ratingCount: 0 });
      } finally {
        setIsTotalLoading(false);
      }
    };

    fetchTotalStats();
  }, [toast]);
  
  const handleFilter = async () => {
    // Always show filtered results when filter button is clicked, even if no filters are applied
    try {
      setIsFilteredLoading(true);
      setFilteredStats(null);
      setFilterError(null);

      const filters = {
          startDate: date?.from ? format(date.from, 'yyyy-MM-dd') + 'T00:00:00.000Z' : undefined,
          endDate: date?.to ? format(date.to, 'yyyy-MM-dd') + 'T23:59:59.999Z' : undefined,
          state: selectedState === 'all-states' ? undefined : selectedState,
          constituency: constituency.trim() || undefined,
      };

      console.log('Applying filters:', filters);
      
      const [userCount, leaderCount, ratingCount] = await Promise.all([
        getUserCount(filters).catch(err => {
          console.error('Error fetching filtered user count:', err);
          return 0;
        }),
        getLeaderCount(filters).catch(err => {
          console.error('Error fetching filtered leader count:', err);
          return 0;
        }),
        getRatingCount(filters).catch(err => {
          console.error('Error fetching filtered rating count:', err);
          return 0;
        }),
      ]);

      console.log('Filtered stats:', { userCount, leaderCount, ratingCount });
      
      // Always set filtered stats, ensuring 0 values are properly displayed
      setFilteredStats({ 
        userCount: Number(userCount) || 0, 
        leaderCount: Number(leaderCount) || 0, 
        ratingCount: Number(ratingCount) || 0 
      });
      
    } catch (error) {
      console.error('Filter error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply filters';
      setFilterError(errorMessage);
      
      // Set filtered stats to 0 when there's an error
      setFilteredStats({ 
        userCount: 0, 
        leaderCount: 0, 
        ratingCount: 0 
      });
      
      toast({
        variant: 'destructive',
        title: 'Filter Error',
        description: 'Failed to apply filters. Please try again.'
      });
    } finally {
      setIsFilteredLoading(false);
    }
  };
  
  const handleReset = () => {
    setDate(undefined);
    setSelectedState('all-states');
    setConstituency('');
    setFilteredStats(null);
    setFilterError(null);
  };

  const statCardsData = [
    { title: 'Users', icon: Users, color: 'text-blue-500', key: 'userCount' as keyof Stats },
    { title: 'Leaders', icon: UserCheck, color: 'text-green-500', key: 'leaderCount' as keyof Stats },
    { title: 'Ratings', icon: MessageSquare, color: 'text-orange-500', key: 'ratingCount' as keyof Stats },
  ];
  
  const StatCard = ({ title, value, icon: Icon, color, loading }: { title: string, value: number, icon: React.ElementType, color: string, loading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
            <Skeleton className="h-8 w-1/4" />
        ) : (
            <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  const retryFetch = async () => {
    setError(null);
    setIsTotalLoading(true);
    
    try {
      const [userCount, leaderCount, ratingCount] = await Promise.all([
        getUserCount(),
        getLeaderCount(),
        getRatingCount(),
      ]);
      
      setTotalStats({ userCount, leaderCount, ratingCount });
    } catch (error) {
      console.error('Retry fetch error:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setIsTotalLoading(false);
    }
  };

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button onClick={retryFetch} variant="outline" size="sm" className="ml-4">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="shadow-lg border-2 border-primary/10">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Filter Statistics</CardTitle>
                <CardDescription>
                    Apply filters to view statistics for specific date ranges, states, or constituencies. 
                    Results will show filtered data counts (0 if no data matches the criteria).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <div className="grid gap-2 lg:col-span-2">
                        <Label className="text-sm font-medium">Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="state-filter" className="text-sm font-medium">State</Label>
                        <Select value={selectedState} onValueChange={setSelectedState}>
                            <SelectTrigger id="state-filter" className="bg-background">
                            <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-states">All States</SelectItem>
                                {indianStates.map(state => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="constituency-filter" className="text-sm font-medium">Constituency</Label>
                        <Input 
                            id="constituency-filter"
                            value={constituency}
                            onChange={(e) => setConstituency(e.target.value)}
                            placeholder="Enter constituency name"
                            className="bg-background"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <Button onClick={handleFilter} disabled={isFilteredLoading} className="w-full">
                            {isFilteredLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Apply Filter
                        </Button>
                        <Button onClick={handleReset} variant="outline" disabled={isFilteredLoading} size="icon" title="Reset Filters">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                
                {/* Filter Summary */}
                {(date?.from || date?.to || selectedState !== 'all-states' || constituency.trim()) && (
                    <div className="bg-muted/50 rounded-lg p-4 border">
                        <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
                        <div className="flex flex-wrap gap-2">
                            {date?.from && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                    <CalendarIcon className="h-3 w-3" />
                                    {date.to ? `${format(date.from, "MMM dd")} - ${format(date.to, "MMM dd, yyyy")}` : format(date.from, "MMM dd, yyyy")}
                                </div>
                            )}
                            {selectedState !== 'all-states' && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                                    State: {selectedState}
                                </div>
                            )}
                            {constituency.trim() && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                                    Constituency: {constituency}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        <Separator />

        <div className="space-y-4">
            <h2 className="text-2xl font-semibold font-headline">Overall Statistics</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statCardsData.map(stat => (
                    <StatCard 
                        key={stat.title}
                        title={`Total ${stat.title}`}
                        value={totalStats?.[stat.key] ?? 0}
                        icon={stat.icon}
                        color={stat.color}
                        loading={isTotalLoading}
                    />
                ))}
            </div>
        </div>
        
        {(isFilteredLoading || filteredStats || filterError) && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold font-headline">
                        Filtered Results
                    </h2>
                    {filteredStats && !isFilteredLoading && (
                        <div className="text-sm text-muted-foreground">
                            {filteredStats.userCount + filteredStats.leaderCount + filteredStats.ratingCount === 0 
                                ? "No data found matching the selected filters" 
                                : `Found ${filteredStats.userCount + filteredStats.leaderCount + filteredStats.ratingCount} total records`
                            }
                        </div>
                    )}
                </div>
                
                {filterError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>{filterError}</span>
                      <Button onClick={handleFilter} variant="outline" size="sm" className="ml-4">
                        Retry Filter
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {statCardsData.map(stat => (
                        <StatCard 
                            key={stat.title}
                            title={`Filtered ${stat.title}`}
                            value={filteredStats?.[stat.key] ?? 0}
                            icon={stat.icon}
                            color={stat.color}
                            loading={isFilteredLoading}
                        />
                    ))}
                </div>
                
                {filteredStats && !isFilteredLoading && (
                    <div className="bg-muted/30 rounded-lg p-4 border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span>
                                {filteredStats.userCount + filteredStats.leaderCount + filteredStats.ratingCount === 0
                                    ? "No records match your filter criteria. Try adjusting your filters or check if data exists for the selected period/location."
                                    : "These results are based on your applied filters. Remove filters to see overall statistics."
                                }
                            </span>
                        </div>
                    </div>
                )}
            </div>
        )}

    </div>
  );
}
