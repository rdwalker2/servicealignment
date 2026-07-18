import BapVisualMatrix from '../../components/process/BapVisualMatrix';

export default function BapReference() {
  return (
    <div className="w-full h-full bg-[#f8f9fa] overflow-y-auto p-12 flex flex-col items-center">
      <div className="max-w-4xl text-center mb-10">
        <h1 className="text-3xl font-black text-[#1d2745] mb-4 uppercase tracking-tight">Buyer's Action Plan Sandbox</h1>
        <p className="text-stone-500 text-[15px] max-w-2xl mx-auto">
          This interactive matrix is the engine of the 4D methodology. Answer the questions on the left by toggling Y/N to see how the Checkpoint scores calculate on the right. 
          Deals cannot advance past a Checkpoint unless it scores in the green.
        </p>
      </div>

      <BapVisualMatrix />
    </div>
  );
}
