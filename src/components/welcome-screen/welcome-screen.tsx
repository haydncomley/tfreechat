'use client';

import classNames from 'classnames';
import { useEffect, useState } from 'react';
import Xarrow from 'react-xarrows';

interface WelcomeScreenProps {
	show: boolean;
	className?: string;
}

export const WelcomeScreen = ({ show, className }: WelcomeScreenProps) => {
	const [showTimeout, setShowTimeout] = useState(false);

	useEffect(() => {
		if (show) {
			setTimeout(() => {
				setShowTimeout(true);
			}, 100);
		} else {
			setShowTimeout(false);
		}
	}, [show]);

	if (!show || !showTimeout) return null;

	return (
		<div
			className={classNames(
				'animate-fade-in pointer-events-none absolute inset-0 z-20 duration-75',
				className,
			)}
		>
			{/* Anchor points for arrows - Small screens */}
			<div
				id="mobile-input-target"
				className="absolute bottom-38 left-1/5 block h-1 w-1 md:hidden"
			/>
			<div
				id="mobile-menu-target"
				className="absolute top-8 left-18 block h-1 w-1 md:hidden"
			/>

			{/* Anchor points for arrows - Medium+ screens */}
			<div
				id="chat-history-target"
				className="absolute top-32 left-[10rem] hidden h-1 w-1 md:block"
			/>
			<div
				id="input-area-target"
				className="absolute bottom-40 left-3/5 hidden h-1 w-1 md:block"
			/>
			<div
				id="settings-target"
				className="absolute bottom-36 left-[17rem] hidden h-1 w-1 md:block"
			/>

			{/* Small screen annotations */}
			<div
				id="input-help-text"
				className="absolute bottom-64 left-1/2 block -translate-x-1/2 md:hidden"
			>
				<div className="text-foreground py-4 text-center text-lg">
					<div className="font-slab font-bold">Start Chatting</div>
					<div className="text-foreground/75 text-base">
						Get started by typing below
					</div>
				</div>
			</div>

			<div
				id="menu-help-text"
				className="absolute top-28 left-40 block md:hidden"
			>
				<div className="text-foreground py-4 text-center text-lg">
					<div className="font-slab font-bold">Chat History</div>
					<div className="text-foreground/75 text-base">
						View your conversations
					</div>
				</div>
			</div>

			{/* Medium+ screen annotations */}
			<div
				id="chat-history-text"
				className="absolute top-60 left-4 hidden md:left-[17.5rem] md:block"
			>
				<div className="text-foreground px-4 text-xl">
					<div className="font-slab font-bold">Chat History</div>
					<div className="text-foreground/75 text-base">
						You conversations will show up here
					</div>
				</div>
			</div>

			{/* Input area annotation */}
			<div
				id="input-text"
				className="absolute bottom-80 left-6/12 hidden -translate-x-1/2 py-4 md:block"
			>
				<div className="text-foreground text-center text-xl">
					<div className="font-slab font-bold">Start Chatting</div>
					<div className="text-foreground/75 text-base">
						Get started by typing something below
					</div>
				</div>
			</div>

			{/* Settings annotation */}
			<div
				id="settings-text"
				className="absolute bottom-50 left-8 hidden md:block"
			>
				<div className="text-foreground py-4 text-center text-xl">
					<div className="font-slab font-bold">Settings & Keys</div>
					<div className="text-foreground/75 text-base">
						Edit your API keys over here
					</div>
				</div>
			</div>

			{/* Arrows for small screens */}
			<div className="block duration-75 md:hidden">
				<Xarrow
					start="input-help-text"
					end="mobile-input-target"
					startAnchor="bottom"
					endAnchor="top"
					color="var(--color-tooltip)"
					strokeWidth={3}
					curveness={0.75}
					showHead={true}
					animateDrawing={0.5}
					headSize={5}
					tailSize={0}
				/>

				<Xarrow
					start="menu-help-text"
					end="mobile-menu-target"
					startAnchor="top"
					endAnchor="right"
					color="var(--color-tooltip)"
					strokeWidth={3}
					curveness={0.75}
					showHead={true}
					animateDrawing={0.5}
					headSize={5}
					tailSize={0}
				/>
			</div>

			{/* Arrows for medium+ screens */}
			<div className="hidden duration-75 md:block">
				<Xarrow
					start="chat-history-text"
					end="chat-history-target"
					startAnchor="left"
					endAnchor="bottom"
					color="var(--color-tooltip)"
					strokeWidth={3}
					curveness={0.75}
					showHead={true}
					animateDrawing={0.5}
					headSize={5}
				/>

				<Xarrow
					start="input-text"
					end="input-area-target"
					startAnchor="bottom"
					endAnchor="top"
					color="var(--color-tooltip)"
					strokeWidth={3}
					curveness={0.75}
					showHead={true}
					animateDrawing={0.5}
					headSize={5}
					tailSize={0}
				/>

				<Xarrow
					start="settings-text"
					end="settings-target"
					startAnchor="bottom"
					endAnchor="bottom"
					color="var(--color-tooltip)"
					strokeWidth={3}
					curveness={0.75}
					showHead={true}
					animateDrawing={0.5}
					headSize={5}
					tailSize={0}
				/>
			</div>
		</div>
	);
};
