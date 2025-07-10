'use client';

import { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, RotateCw } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';
import { useToast } from "@/hooks/use-toast";
import { indianStates } from '@/data/locations';
import type { User } from '@/data/users';

const profileSchema = z.object({
  name: z.string().min(1, "Name is required."),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  age: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number({ invalid_type_error: 'Please enter a valid number' }).int().positive("Age must be positive").optional()
  ),
  state: z.string().optional(),
  mpConstituency: z.string().optional(),
  mlaConstituency: z.string().optional(),
  panchayat: z.string().optional(),
});

interface ProfileFormProps {
  user: User | null;
  onSave: (data: Partial<User>) => void;
}

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      gender: "",
      age: undefined,
      state: "",
      mpConstituency: "",
      mlaConstituency: "",
      panchayat: "",
    }
  });
  
  const resetFormValues = () => {
    if (user) {
      form.reset({
        name: user.name || "",
        gender: (user.gender as "" | "male" | "female" | "other" | undefined) || "",
        age: user.age || undefined,
        state: user.state || "",
        mpConstituency: user.mpConstituency || "",
        mlaConstituency: user.mlaConstituency || "",
        panchayat: user.panchayat || "",
      });
    }
  };

  useEffect(() => {
    resetFormValues();
  }, [user]);
  
  const handleReset = () => {
    resetFormValues();
  }

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    onSave(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-sm">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
           <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profileDialog.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('profileDialog.genderLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder={t('profileDialog.genderPlaceholder')} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="male">{t('addLeaderPage.genderMale')}</SelectItem>
                        <SelectItem value="female">{t('addLeaderPage.genderFemale')}</SelectItem>
                        <SelectItem value="other">{t('addLeaderPage.genderOther')}</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profileDialog.ageLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profileDialog.stateLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={t('profileDialog.statePlaceholder')} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {indianStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mpConstituency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profileDialog.mpConstituencyLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('profileDialog.mpConstituencyPlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <FormField
              control={form.control}
              name="mlaConstituency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profileDialog.mlaConstituencyLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('profileDialog.mlaConstituencyPlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="panchayat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profileDialog.panchayatLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('profileDialog.panchayatPlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
         </div>
         <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCw />
              {t('profileDialog.resetButton')}
            </Button>
            <Button type="submit">
              <Save />
              {t('profileDialog.saveButton')}
            </Button>
          </div>
      </form>
    </Form>
  );
}
