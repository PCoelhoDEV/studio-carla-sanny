import React, { useState } from 'react';
import { Check, Clock, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

const CATEGORIES = [
  { id: 'all', label: '🌸 Todos os Serviços' },
  { id: 'podologia', label: '🦶 Podologia' },
  { id: 'manicure', label: '💅 Manicure & Unhas' },
  { id: 'sobrancelhas', label: '✨ Sobrancelhas' },
  { id: 'depilacao', label: '🌿 Depilação' },
];

export default function StepServices({
  services,
  selectedServices,
  onToggleService,
  onNext,
  largeTextMode
}) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  const totalAmount = selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="pb-32">
      {/* Category horizontal scrolling selector */}
      <div className="px-4 mb-4">
        <p className={`font-bold text-stone-800 mb-2 ${largeTextMode ? 'text-lg' : 'text-base'}`}>
          1. Escolha o serviço que você deseja:
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 border ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-stone-700 border-rose-100 hover:bg-rose-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="px-4 space-y-3.5">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.some(s => s.id === service.id);

          return (
            <div
              key={service.id}
              onClick={() => onToggleService(service)}
              className={`apple-card rounded-2xl p-4 sm:p-5 transition-all cursor-pointer relative overflow-hidden border-2 ${
                isSelected
                  ? 'border-rose-500 bg-rose-50/50 shadow-md ring-2 ring-rose-200'
                  : 'border-rose-100 hover:border-rose-200 bg-white/95 apple-shadow'
              }`}
            >
              {service.popular && (
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-rose-400 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Mais Procurado</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[11px] font-semibold tracking-wide text-rose-600 uppercase">
                    {service.categoryLabel}
                  </span>
                  
                  <h3 className={`font-bold text-stone-900 leading-snug mt-0.5 ${
                    largeTextMode ? 'text-lg' : 'text-base'
                  }`}>
                    {service.name}
                  </h3>

                  <p className={`text-stone-600 mt-1 leading-relaxed ${
                    largeTextMode ? 'text-sm' : 'text-xs'
                  }`}>
                    {service.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-rose-100/70">
                    <div className="flex items-center gap-1 text-stone-500 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>{service.duration} min</span>
                    </div>

                    <div className={`font-extrabold text-rose-600 ${
                      largeTextMode ? 'text-xl' : 'text-lg'
                    }`}>
                      {formatCurrency(service.price)}
                    </div>
                  </div>
                </div>

                {/* Big Apple-like Selection Action */}
                <div className="shrink-0 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleService(service);
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-md scale-105'
                        : 'bg-rose-100/80 text-rose-600 hover:bg-rose-200 active:scale-95'
                    }`}
                    aria-label={isSelected ? 'Remover serviço' : 'Adicionar serviço'}
                  >
                    {isSelected ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : (
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    )}
                  </button>
                  <span className={`text-[10px] font-bold mt-1.5 ${
                    isSelected ? 'text-rose-600' : 'text-stone-500'
                  }`}>
                    {isSelected ? 'Escolhido' : 'Adicionar'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Bar (Mobile First) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-rose-200/80 shadow-2xl z-40 max-w-md mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-stone-500 uppercase">
              {selectedServices.length === 0 ? 'Nenhum selecionado' : `${selectedServices.length} serviço(s)`}
            </p>
            <p className={`font-extrabold text-stone-900 ${largeTextMode ? 'text-2xl' : 'text-xl'}`}>
              {formatCurrency(totalAmount)}
            </p>
            {totalDuration > 0 && (
              <p className="text-[11px] text-rose-600 font-medium">
                Duração total: aprox. {totalDuration} min
              </p>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={selectedServices.length === 0}
            className={`min-h-[56px] px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
              selectedServices.length > 0
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            } ${largeTextMode ? 'text-base' : 'text-sm'}`}
          >
            <span>Escolher Data & Hora</span>
            <span className="text-lg">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
