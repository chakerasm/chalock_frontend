import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applyTemplate, createTemplate, deleteTemplate, duplicateTemplate, getTemplates, updateTemplate } from '@/features/templates/services/templates.service'
import type { ApplyTemplateInput, CreateTemplateInput, TemplateFilters, UpdateTemplateInput } from '@/features/templates/types/templates.types'
export const templateQueryKeys = { all: ['templates'] as const, list: (filters: TemplateFilters) => [...templateQueryKeys.all, filters] as const }
export function useTemplates(filters: TemplateFilters = {}) { return useQuery({ queryKey: templateQueryKeys.list(filters), queryFn: () => getTemplates(filters) }) }
function useTemplateMutation<T>(mutationFn: (input: T) => Promise<unknown>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: templateQueryKeys.all }) }) }
export const useCreateTemplate = () => useTemplateMutation<CreateTemplateInput>(createTemplate)
export const useUpdateTemplate = () => useTemplateMutation<UpdateTemplateInput>(updateTemplate)
export const useDeleteTemplate = () => useTemplateMutation<string>(deleteTemplate)
export const useDuplicateTemplate = () => useTemplateMutation<string>(duplicateTemplate)
export const useApplyTemplate = () => { const client = useQueryClient(); return useMutation({ mutationFn: (input: ApplyTemplateInput) => applyTemplate(input), onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: ['tasks'] }), client.invalidateQueries({ queryKey: ['planner'] }), client.invalidateQueries({ queryKey: ['notes'] }), client.invalidateQueries({ queryKey: ['habits'] })]) }) }
