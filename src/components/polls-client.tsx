'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { getActivePollsForUser, getPollById } from '@/data/polls';
import type { PollListItem, Poll } from '@/data/polls';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Vote, Check, Clock, Users, Share2, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent as DialogPrimitiveContent,
  DialogHeader as DialogPrimitiveHeader,
  DialogTitle as DialogPrimitiveTitle,
  DialogDescription as DialogPrimitiveDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter, useSearchParams } from 'next/navigation';

type PollCardProps = {
    poll: PollListItem & { user_has_voted: boolean; description: string | null; };
    onParticipateClick: (pollId: string) => void;
    highlightAndSuggestParticipation?: boolean;
};

const ShareDialog = ({ poll, open, onOpenChange }: { poll: PollListItem, open: boolean, onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/polls?id=${poll.id}`);
    }
  }, [poll.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: t('pollsPage.copiedToClipboard'),
      description: t('pollsPage.shareLinkCopied'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitiveContent className="sm:max-w-md">
        <DialogPrimitiveHeader>
          <DialogPrimitiveTitle>{t('pollsPage.shareDialogTitle')}</DialogPrimitiveTitle>
          <DialogPrimitiveDescription>
            {t('pollsPage.shareDialogDescription')}
          </DialogPrimitiveDescription>
        </DialogPrimitiveHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="link"
              defaultValue={shareUrl}
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={copyToClipboard}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
            <div className="flex gap-2">
                <Button asChild variant="outline">
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Participate in this poll: ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                    </a>
                </Button>
                <Button asChild variant="outline">
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Participate in this poll:`)}`} target="_blank" rel="noopener noreferrer">
                        Twitter
                    </a>
                </Button>
                <Button asChild variant="outline">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
                        Facebook
                    </a>
                </Button>
            </div>
        </DialogFooter>
      </DialogPrimitiveContent>
    </Dialog>
  );
};

const PollCard = ({ poll, onParticipateClick, highlightAndSuggestParticipation }: PollCardProps) => {
    const [isShareDialogOpen, setShareDialogOpen] = useState(false);
    const { t } = useLanguage();
    return (
        <>
        <Card id={`poll-${poll.id}`} className="flex flex-col h-full bg-card hover:border-primary/50 border-transparent border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl group">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{poll.title}</CardTitle>
                    <Button size="icon" onClick={(e) => { e.stopPropagation(); setShareDialogOpen(true); }}>
                        <Share2 className="h-5 w-5" />
                    </Button>
                </div>
                {poll.description && <CardDescription className="text-xs line-clamp-2 pt-1">{poll.description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground pt-0">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary/70" />
                    <span>
                        {poll.active_until ? t('pollsPage.closesOn', { date: format(new Date(poll.active_until), 'PPP') }) : 'No end date'}
                    </span>
                </div>
                 <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary/70" />
                    <span>{t('pollsPage.totalResponses', { count: poll.response_count })}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30 rounded-b-2xl flex items-center gap-2">
                {poll.user_has_voted ? (
                     <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                        <Check className="mr-2"/> {t('pollsPage.votedButton')}
                    </Button>
                ) : (
                    <Button 
                        className={`w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20 ${highlightAndSuggestParticipation ? 'animate-pulse' : ''}`}
                        onClick={() => onParticipateClick(poll.id)}
                    >
                        <Vote className="mr-2"/> {t('pollsPage.participateButton')}
                    </Button>
                )}
            </CardFooter>
        </Card>
        <ShareDialog poll={poll} open={isShareDialogOpen} onOpenChange={setShareDialogOpen} />
        </>
    );
};

export const PollsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col rounded-2xl">
                <CardHeader className="bg-secondary/50"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full mt-2" /><Skeleton className="h-4 w-1/2 mt-1" /></CardHeader>
                <CardContent className="flex-grow pt-4"><Skeleton className="h-4 w-2/3" /></CardContent>
                <CardFooter className="p-4"><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
        ))}
    </div>
);

export function PollsPageContent() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [polls, setPolls] = useState<(PollListItem & { user_has_voted: boolean; description: string | null; })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const [specificPollFromQuery, setSpecificPollFromQuery] = useState<(PollListItem & { user_has_voted: boolean; description: string | null; }) | null>(null);

    useEffect(() => {
        const pollIdFromQuery = searchParams.get('id');
        if (pollIdFromQuery && !isLoading) {
            const element = document.getElementById(`poll-${pollIdFromQuery}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', 'block': 'center' });
                element.classList.add('shadow-2xl', 'shadow-primary/50', 'ring-2', 'ring-primary');
                setTimeout(() => {
                    element.classList.remove('shadow-2xl', 'shadow-primary/50', 'ring-2', 'ring-primary');
                }, 3000);
            }
        }
    }, [searchParams, isLoading]);

    useEffect(() => {
        const fetchPolls = async () => {
            setIsLoading(true);
            const pollIdFromQuery = searchParams.get('id');

            if (user) {
                const pollsData = await getActivePollsForUser(user.id);
                setPolls(pollsData);
            } else if (pollIdFromQuery) {
                const specific = await getPollById(pollIdFromQuery);
                if (specific) {
                    setSpecificPollFromQuery({
                        id: specific.id,
                        title: specific.title,
                        description: specific.description,
                        is_active: specific.is_active,
                        active_until: specific.active_until,
                        created_at: specific.created_at,
                        response_count: 0,
                        user_has_voted: false,
                    });
                }
            }
            setIsLoading(false);
        };
        fetchPolls();
    }, [user, authLoading, searchParams]);
    
    const handleParticipate = (pollId: string) => {
        if (!user) {
            setSelectedPollId(pollId);
            setShowLoginDialog(true);
        } else {
            router.push(`/polls/${pollId}`);
        }
    };
    
    return (
        <>
            <div className="flex flex-col min-h-screen bg-secondary/50">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-12">
                    <div className="text-left mb-12">
                        <h1 className="text-3xl font-extrabold font-headline text-primary">{t('pollsPage.heading')}</h1>
                        <p className="mt-2 max-w-2xl text-md text-muted-foreground">
                            {t('pollsPage.subheading')}
                        </p>
                    </div>

                    {authLoading || isLoading ? (
                        <PollsSkeleton />
                    ) : user ? (
                        polls.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {polls.map(poll => (
                                    <PollCard 
                                        key={poll.id} 
                                        poll={poll} 
                                        onParticipateClick={handleParticipate} 
                                        highlightAndSuggestParticipation={poll.id === searchParams.get('id')}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 px-4 rounded-lg bg-background border-2 border-dashed">
                                <Vote className="w-16 h-16 mx-auto text-muted-foreground" />
                                <h2 className="mt-6 text-2xl font-semibold">{t('pollsPage.noPollsTitle')}</h2>
                                <p className="mt-2 text-muted-foreground">{t('pollsPage.noPollsDescription')}</p>
                            </div>
                        )
                    ) : (
                        specificPollFromQuery ? (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold font-headline mb-4">
                                    {t('pollsPage.sharedPollTitle')}
                                </h2>
                                <Separator className="mb-8" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                    <PollCard 
                                        poll={specificPollFromQuery} 
                                        onParticipateClick={handleParticipate} 
                                        highlightAndSuggestParticipation={true} 
                                    />
                                </div>
                                <Separator className="mb-8" />
                                <div className="text-center py-8 px-4 rounded-lg bg-background border-2 border-dashed">
                                    <Vote className="w-16 h-16 mx-auto text-muted-foreground" />
                                    <h2 className="mt-6 text-2xl font-semibold">{t('pollsPage.loginRequiredTitle')}</h2>
                                    <p className="mt-2 text-muted-foreground">{t('pollsPage.loginRequiredDescription')}</p>
                                    <Button onClick={() => router.push('/login?redirect=/polls')} className="mt-6">
                                        {t('pollsPage.login')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-24 px-4 rounded-lg bg-background border-2 border-dashed">
                                <Vote className="w-16 h-16 mx-auto text-muted-foreground" />
                                <h2 className="mt-6 text-2xl font-semibold">{t('pollsPage.loginRequiredTitle')}</h2>
                                <p className="mt-2 text-muted-foreground">{t('pollsPage.loginRequiredDescription')}</p>
                                <Button onClick={() => router.push('/login?redirect=/polls')} className="mt-6">
                                    {t('pollsPage.login')}
                                </Button>
                            </div>
                        )
                    )}
                </main>
                <Footer />
            </div>

            <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('pollsPage.loginRequiredTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('pollsPage.loginRequiredDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedPollId(null)}>{t('pollsPage.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push(`/login?redirect=/polls/${selectedPollId}`)}>
                            {t('pollsPage.login')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
