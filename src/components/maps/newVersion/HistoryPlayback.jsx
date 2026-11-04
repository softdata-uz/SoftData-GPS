import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {Button, cx} from '../../../ui/ui';
import {ChevronLeftIcon, ChevronRightIcon, CloseIcon, PauseIcon, PlayIcon} from '../../../ui/icons';

/* Tarix bo'ylab yurish: play/pause, tezlik va vaqt chizig'i
   (SoftData-AirPort-GPS `HistoryPlayback`). Nuqtalar teng qadamda o'ynatiladi —
   backend har nuqta uchun vaqt bermaydi. */

const SPEEDS = [1, 2, 4, 8];
const STEP_MS = 260; // 1x tezlikda bitta nuqta

const HistoryPlayback = ({points, index, onIndexChange, onClose}) => {
    const {t} = useTranslation();
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    const last = Math.max(points.length - 1, 0);
    const progress = last ? (index / last) * 100 : 0;

    useEffect(() => {
        if (!playing) return undefined;
        const id = setInterval(() => {
            onIndexChange((current) => {
                if (current >= last) {
                    setPlaying(false);
                    return last;
                }
                return current + 1;
            });
        }, STEP_MS / speed);
        return () => clearInterval(id);
    }, [playing, speed, last, onIndexChange]);

    const toggle = () => {
        if (index >= last) onIndexChange(0);
        setPlaying((v) => !v);
    };

    const step = (delta) => {
        setPlaying(false);
        onIndexChange((current) => Math.min(Math.max(current + delta, 0), last));
    };

    return (
        <div className="hp" role="group" aria-label={t('Tarix')}>
            <div className="hp__transport">
                <button type="button" className="hp__step" onClick={() => step(-1)} aria-label={t('Oldingi')}>
                    <ChevronLeftIcon size={16}/>
                </button>
                <button type="button" className={cx('hp__play', playing && 'is-playing')} onClick={toggle}
                        aria-label={playing ? t('Pauza') : t('Ijro')}>
                    {playing ? <PauseIcon size={18}/> : <PlayIcon size={18}/>}
                </button>
                <button type="button" className="hp__step" onClick={() => step(1)} aria-label={t('Keyingi')}>
                    <ChevronRightIcon size={16}/>
                </button>
            </div>

            <div className="hp__timeline">
                <input
                    type="range"
                    min={0}
                    max={last}
                    value={index}
                    onChange={(e) => {
                        setPlaying(false);
                        onIndexChange(Number(e.target.value));
                    }}
                    aria-label={t('Tarix')}
                    className="gps-scrubber"
                    style={{'--p': `${progress}%`}}
                />
                <span className="hp__count">
                    <b>{index + 1}</b> / {points.length}
                </span>
            </div>

            <div className="hp__speeds" role="group" aria-label={t('Tezlik')}>
                {SPEEDS.map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setSpeed(value)}
                        aria-pressed={speed === value}
                        className={cx('hp__speed', speed === value && 'is-active')}
                    >
                        {value}x
                    </button>
                ))}
            </div>

            <span className="hp__sep" aria-hidden="true"/>

            <Button variant="tertiary-gray" size="sm" iconOnly iconLeading={<CloseIcon size={18}/>}
                    onClick={onClose} aria-label={t('Yopish')} title={t('Yopish')}/>
        </div>
    );
};

export default HistoryPlayback;
