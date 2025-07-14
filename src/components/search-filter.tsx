'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { Label } from '@/components/ui/label';
import { RotateCw, Search } from 'lucide-react';

type ElectionType = 'national' | 'state' | 'panchayat' | '';

interface SearchFilterProps {
  onSearch: (filters: { electionType: ElectionType; searchTerm: string; candidateName: string; }) => void;
}

export default function SearchFilter({ onSearch }: SearchFilterProps) {
  const [electionType, setElectionType] = useState<ElectionType>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [showConstituencyError, setShowConstituencyError] = useState(false); // State for constituency validation
  const [showElectionTypeError, setShowElectionTypeError] = useState(false); // New state for election type validation
  const { t } = useLanguage();

  const handleSearchClick = () => {
    // Validation: If Constituency Name is entered, Election Type must be selected
    if (searchTerm.trim() && !electionType) {
      setShowElectionTypeError(true);
      setShowConstituencyError(false); // Clear other error
      return;
    }

    // Validation: If Election Type is selected, Constituency Name must be entered
    if (electionType && !searchTerm.trim()) {
      setShowConstituencyError(true);
      setShowElectionTypeError(false); // Clear other error
      return;
    }

    setShowConstituencyError(false); // Clear all errors if validation passes
    setShowElectionTypeError(false);
    onSearch({ electionType, searchTerm, candidateName });
  };

  const handleResetClick = () => {
    setElectionType('');
    setSearchTerm('');
    setCandidateName('');
    setShowConstituencyError(false); // Reset all errors on clear
    setShowElectionTypeError(false);
    onSearch({ electionType: '', searchTerm: '', candidateName: '' });
  };

  const getPlaceholder = () => {
    if (!electionType) return t('searchFilter.placeholder.default');
    return t(`searchFilter.placeholder.${electionType}`);
  }

  return (
    <div className="p-6 bg-secondary/50 rounded-lg mb-8 border border-border">
      <form onSubmit={(e) => { e.preventDefault(); handleSearchClick(); }}>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] grid gap-2">
            <Label htmlFor="candidate-name" className="font-semibold">
              {t('searchFilter.candidateNameLabel')}
            </Label>
            <Input
              id="candidate-name"
              placeholder={t('searchFilter.candidateNamePlaceholder')}
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="flex items-center justify-center text-muted-foreground font-semibold text-lg mb-2">
            {t('searchFilter.orText')}
          </div>

          <div className="flex-1 min-w-[200px] grid gap-2">
            <Label htmlFor="election-type" className="font-semibold">
              {t('searchFilter.electionTypeLabel')}
            </Label>
            <Select value={electionType} onValueChange={(value) => {
              setElectionType(value as ElectionType);
              setShowElectionTypeError(false); // Clear error on change
            }}>
              <SelectTrigger id="election-type" className={`bg-background ${showElectionTypeError ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={t('searchFilter.electionTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national">{t('searchFilter.national')}</SelectItem>
                <SelectItem value="state">{t('searchFilter.state')}</SelectItem>
                <SelectItem value="panchayat">{t('searchFilter.panchayat')}</SelectItem>
              </SelectContent>
            </Select>
            {showElectionTypeError && (
              <p className="text-red-500 text-xs mt-1">{t('searchFilter.electionTypeRequiredError')}</p>
            )}
          </div>
          
          <div className="flex-1 min-w-[200px] grid gap-2">
            <Label htmlFor="search-term" className="font-semibold">
              {t('searchFilter.constituencyLabel')}
            </Label>
            <Input
              id="search-term"
              placeholder={getPlaceholder()}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowConstituencyError(false); // Clear error on input change
              }}
              className={`bg-background ${showConstituencyError ? 'border-red-500' : ''}`}
            />
            {showConstituencyError && (
              <p className="text-red-500 text-xs mt-1">{t('searchFilter.constituencyRequiredError')}</p>
            )}
          </div>
          
          <div className="flex gap-2 self-end">
              <Button onClick={handleResetClick} variant="outline" type="button">
                  <RotateCw className="mr-2 h-4 w-4" />
                  {t('searchFilter.resetButton')}
              </Button>
              <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  {t('searchFilter.searchButton')}
              </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
